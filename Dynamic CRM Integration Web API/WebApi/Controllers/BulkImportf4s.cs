using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using System.Data;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class BulkImportf4s : ControllerBase
    {
        private readonly ILogger<BulkImportf4s> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public enum SubGroupType
        {
            ProvideHoursOfOperation = SubmissionGroups.GroupType.ProvideHoursOfOperation,
            ProvideEnergyInputs = SubmissionGroups.GroupType.ProvideEnergyInputs,
            ProvidePowerOutputs = SubmissionGroups.GroupType.ProvidePowerOutputs,
            ProvideHeatOutputs = SubmissionGroups.GroupType.ProvideHeatOutputs,
            SecretaryOfStateExemptionCertificate = SubmissionGroups.GroupType.SecretaryOfStateExemptionCertificate,
            ProvideInformationFinancialBenefits = SubmissionGroups.GroupType.ProvideInformationFinancialBenefits,
            SubmitToAssessor = SubmissionGroups.GroupType.SubmitToAssessor,

        }
        bool ProvideHoursOfOperation = false;
        bool ProvideEnergyInputs = false;
        bool ProvidePowerOutputs = false;
        bool ProvideHeatOutputs = false;
        bool SecretaryOfStateExemptionCertificate = false;
        bool ProvideInformationFinancialBenefits = false;

        public BulkImportf4s(ILogger<BulkImportf4s> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Bulk Import of F4S file.
        /// </summary>
        /// <response code="200">If the file was imported successfully</response>
        /// <response code="400">If no file was imported or wrong type of file (different than ".xlsx" or "xls")</response>
        /// <response code="500">If a file with all cells empty was uploaded or If there is a server error</response>
        [ProducesResponseType(typeof(ReplyMessage), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("BulkImportf4s")]
        public async Task<IActionResult> BulkImportExcel(ImportFile importdata)
        {
            try
            {             
                ReplyMessage reply = new ReplyMessage();

                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    // check if user can upload a spreadsheet
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(importdata.SubmissionId), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //
                    if (!await UpdSectionStatusesFun.SectionStatusesForBulkImport(new Guid(importdata.SubmissionId), serviceClient, _logger))
                    {
                        reply.message = "Cannot upload a file yet, Scheme Details and Scheme Capacity Details are not Completed.";
                        return BadRequest(reply);
                    }

                }


                if (importdata.file == null || importdata.file.Length == 0)
                {
                    reply = new ReplyMessage();
                    reply.message = "No file uploaded.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }

                var fileExtension = Path.GetExtension(importdata.file.FileName);
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    reply = new ReplyMessage();
                    reply.message = "Invalid file format. Please upload an Excel file.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }
           
                var memoryStream = new MemoryStream();
                IFormFile file = importdata.file;
                await file.CopyToAsync(memoryStream);

                string submissionId = importdata.SubmissionId;

                await Task.Run(async () =>
                {
                    try
                    {
                        await ProcessFileAsync(memoryStream, submissionId);
                    }
                    catch (Exception ex)
                    {
                        await LogErrorAsync(ex, submissionId);
                        _logger.LogError(ex, "Error during task execution for SubmissionId: {SubmissionId}", submissionId);

                        CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                        await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                    }
                    finally
                    {
                        memoryStream.Dispose();
                    }
                });

                reply.message = "Import Finished Successfully";
                return Ok(reply);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }
        private async Task LogErrorAsync(Exception ex, string submissionId)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {
                var bulkimportlog = new Entity("desnz_bulkimportlog")
                {
                    ["desnz_name"] = "BulkImportf4s",
                    ["desnz_submission"] = new EntityReference("desnz_submission", new Guid(submissionId)),
                    ["desnz_datetimefinish"] = DateTime.Now,
                    ["desnz_output"] = ex.Message
                };
                await serviceClient.CreateAsync(bulkimportlog);
            }
        }
        private async Task ProcessFileAsync(MemoryStream memoryStream, string submissionid)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {           
                var data = new List<f4sModel>();

                using (var workbook = new XLWorkbook(memoryStream))
                {
                    var sheet = workbook.Worksheet(2);

                    // Get column information
                    var columnInfo = sheet.Row(1).Cells().Select((cell, index) => new
                    {
                        Index = index + 1,
                        ColumnName = cell.GetValue<string>()
                    }).ToList();

                    // Iterate through the rows
                    foreach (var row in sheet.RowsUsed().Skip(1))
                    {
                        var record = new f4sModel();
                        foreach (var prop in typeof(f4sModel).GetProperties())
                        {
                            var colInfo = columnInfo.SingleOrDefault(c => string.Join("", c.ColumnName.Split(default(string[]), StringSplitOptions.RemoveEmptyEntries)) == prop.Name);
                            if (colInfo != null)
                            {
                                var cell = row.Cell(colInfo.Index);
                                var cellValue = cell.Value;

                                if (!cell.IsEmpty())
                                {
                                    Type t = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                                    object safeValue = null;

                                    if (t == typeof(int))
                                    {
                                        safeValue = cell.GetValue<int>();
                                    }
                                    else if (t == typeof(double))
                                    {
                                        safeValue = cell.GetValue<double>();
                                    }
                                    else if (t == typeof(decimal))
                                    {
                                        safeValue = cell.GetValue<decimal>();
                                    }
                                    else if (t == typeof(DateTime))
                                    {
                                        safeValue = cell.GetValue<DateTime>();
                                    }
                                    else if (t == typeof(bool))
                                    {
                                        var tempsafeValue = cell.GetValue<string>();
                                        if (tempsafeValue.ToUpper() == "YES") safeValue = true;
                                        else if (tempsafeValue.ToUpper() == "NO") safeValue = false;
                                    }
                                    else if (t == typeof(string))
                                    {
                                        safeValue = cell.GetValue<string>();
                                    }
                                    else
                                    {
                                        safeValue = Convert.ChangeType(cellValue, t);
                                    }

                                    prop.SetValue(record, safeValue, null);
                                }
                            }
                        }
                        data.Add(record);
                    }
                    await ProcessCRMData(_serviceClientFactory, data, submissionid);
                }
            }
        }
        private async Task ProcessCRMData(IServiceClientFactory serviceClientFactory, List<f4sModel> data, string submissionId)
        {
            decimal sumfnx = 0;
            decimal sumfny = 0;

            using (var serviceClient = serviceClientFactory.CreateServiceClient())
            {

                QueryExpression relatedquery = new QueryExpression
                {
                    EntityName = "desnz_fuelmeters", 
                    ColumnSet = new ColumnSet("desnz_measuretype", "desnz_fuelmetersid"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal,new Guid(submissionId) )
                        }
                    }
                };

                EntityCollection relatedmeterresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                QueryExpression submissionquery = new QueryExpression
                {
                    EntityName = "desnz_submission",
                    ColumnSet = new ColumnSet("desnz_scheme", "desnz_chptotalpowercapacity", "desnz_thepowerefficiencythresholdforyourschemeis", "desnz_whatistheqithresholdforyourscheme"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_submissionid", ConditionOperator.Equal,new Guid(submissionId))
                        }
                    }
                };

                EntityCollection submissionresults = await serviceClient.RetrieveMultipleAsync(submissionquery);


                decimal chptotalpowercapacity = (decimal)submissionresults.Entities.FirstOrDefault().GetAttributeValue<double>("desnz_chptotalpowercapacity");

                EntityReference schemeEntityRef = null;

                if (submissionresults.Entities[0].Attributes.Contains("desnz_scheme") && submissionresults.Entities[0]["desnz_scheme"] != null)
                {
                    schemeEntityRef = submissionresults.Entities[0]["desnz_scheme"] as EntityReference;
                }

                string schemeName = schemeEntityRef?.Name ?? string.Empty;

                Guid schemeId = schemeEntityRef == null ? Guid.Empty : schemeEntityRef.Id;

                QueryExpression policyquery = new QueryExpression
                {
                    EntityName = "desnz_scheme",
                    ColumnSet = new ColumnSet("desnz_policychpqa"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_schemeid", ConditionOperator.Equal, schemeId)
                        }
                    }

                };

                EntityCollection schemepolicyresults = await serviceClient.RetrieveMultipleAsync(policyquery);

                EntityReference schemepolicy = null;

                if (schemepolicyresults.Entities[0].Attributes.Contains("desnz_policychpqa") && schemepolicyresults.Entities[0]["desnz_policychpqa"] != null)
                {
                    schemepolicy = schemepolicyresults.Entities[0]["desnz_policychpqa"] as EntityReference;
                }

                string policyName = schemepolicy?.Name ?? string.Empty;

                Guid policyId = schemepolicy == null ? Guid.Empty : schemepolicy.Id;

                QueryExpression query = new QueryExpression
                {
                    EntityName = "desnz_fuelcategory",
                    ColumnSet = new ColumnSet("desnz_fuelcategoryid", "desnz_name")
                };

                EntityCollection fuelcategoryresults = await serviceClient.RetrieveMultipleAsync(query);

                query = new QueryExpression
                {
                    EntityName = "desnz_fuel",
                    ColumnSet = new ColumnSet("desnz_fuelid", "desnz_name")
                };

                EntityCollection fuelresults = await serviceClient.RetrieveMultipleAsync(query);

                bool hasEnergyInputs = false;
                bool hasPowerOutputs = false;
                bool hasHeatOutputs = false;


                if (relatedmeterresults.Entities.Count > 0)
                {
                    foreach (Entity meterentity in relatedmeterresults.Entities)
                    {
                        if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.EnergyInput)
                        {
                            bool isFuelGroupFilled = !string.IsNullOrEmpty(data.FirstOrDefault().Fuelcategory) &&
                                    !string.IsNullOrEmpty(data.FirstOrDefault().Fueltype) &&
                                    data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsenergyinput != null &&
                                    data.FirstOrDefault().Annualtotalenergyinput > 0;

                            if (isFuelGroupFilled)
                            {

                                query = new QueryExpression
                                {
                                    EntityName = "desnz_fuelcategoryxy",
                                    ColumnSet = new ColumnSet("desnz_x", "desnz_y"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("desnz_category", ConditionOperator.Equal, fuelcategoryresults.Entities.FirstOrDefault(a => a.GetAttributeValue<string>("desnz_name") == data.FirstOrDefault().Fuelcategory).GetAttributeValue<Guid>("desnz_fuelcategoryid")),
                                            new ConditionExpression("desnz_policy", ConditionOperator.Equal, policyId),
                                            new ConditionExpression("desnz_beginrangemwe", ConditionOperator.LessEqual, chptotalpowercapacity/1000),
                                            new ConditionExpression("desnz_endrangemwe", ConditionOperator.GreaterEqual, chptotalpowercapacity/1000)
                                        }
                                    }
                                };

                                EntityCollection fuelcategoryresultsxy = serviceClient.RetrieveMultiple(query);

                                relatedquery = new QueryExpression
                                {
                                    EntityName = "desnz_fuelinputs",
                                    ColumnSet = new ColumnSet("desnz_fuelinputsid", "desnz_meter"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("desnz_meter", ConditionOperator.Equal, meterentity.GetAttributeValue<Guid>("desnz_fuelmetersid"))
                                        }
                                    }
                                };

                                EntityCollection relatedModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                                // energy input
                                foreach (Entity entity in relatedModelresults.Entities)
                                {
                                    hasEnergyInputs = true;

                                    var meter = entity["desnz_meter"] as EntityReference;

                                    Entity energyInput = new Entity("desnz_fuelinputs", entity.GetAttributeValue<Guid>("desnz_fuelinputsid"));

                                    energyInput["desnz_calculationused"] = data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsenergyinput;
                                    energyInput["desnz_annualtotal"] = data.FirstOrDefault().Annualtotalenergyinput;
                                    energyInput["desnz_xvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                                    energyInput["desnz_yvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");
                                    energyInput["desnz_fnxn"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x") * (decimal)1.0;
                                    energyInput["desnz_fn_yn"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y") * (decimal)1.0;
                                    energyInput["desnz_fractionoftotalfuelinput"] = (decimal)100;

                                    energyInput["desnz_fuelcategory"] = new EntityReference("desnz_fuelcategory", fuelcategoryresults.Entities.FirstOrDefault(a => a.GetAttributeValue<string>("desnz_name") == data.FirstOrDefault().Fuelcategory).GetAttributeValue<Guid>("desnz_fuelcategoryid"));
                                    energyInput["desnz_fuel"] = new EntityReference("desnz_fuel", fuelresults.Entities.FirstOrDefault(a => a.GetAttributeValue<string>("desnz_name") == data.FirstOrDefault().Fueltype).GetAttributeValue<Guid>("desnz_fuelid"));

                                    if (data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsenergyinput==true)                                    
                                    {
                                         sumfnx += (decimal)energyInput["desnz_xvalue"];
                                         sumfny += (decimal)energyInput["desnz_yvalue"];
                                    }

                                    ProvideEnergyInputs = true;

                                    await serviceClient.UpdateAsync(energyInput);
                                }

                            }
                        }

                        if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.HeatOutput)
                        {
                            bool isHeatGroupFilled = !string.IsNullOrEmpty(data.FirstOrDefault().Heattype) &&
                                                    data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsheatoutputs != null &&
                                                    data.FirstOrDefault().Annualtotalofheatoutputs > 0;

                            if (isHeatGroupFilled)
                            {
                                relatedquery = new QueryExpression
                                {
                                    EntityName = "desnz_heatoutput",
                                    ColumnSet = new ColumnSet("desnz_heatoutputid", "desnz_meter"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("desnz_meter", ConditionOperator.Equal,  meterentity.GetAttributeValue<Guid>("desnz_fuelmetersid"))
                                        }
                                    }
                                };

                                EntityCollection relatedHeatModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                                // heat output
                                foreach (Entity entity in relatedHeatModelresults.Entities)
                                {
                                    hasHeatOutputs = true;
                                    Entity Heatoutput = new Entity("desnz_heatoutput", entity.GetAttributeValue<Guid>("desnz_heatoutputid"));

                                    Heatoutput["desnz_arethereanychpqacalculations"] = data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsheatoutputs;
                                    Heatoutput["desnz_annualtotal"] = data.FirstOrDefault().Annualtotalofheatoutputs;

                                    if (data.FirstOrDefault().Heattype == "Supplied to site")
                                        Heatoutput["desnz_type"] = new OptionSetValue(0);
                                    else if (data.FirstOrDefault().Heattype == "Exported") Heatoutput["desnz_type"] = new OptionSetValue(1);

                                    ProvideHeatOutputs = true;
                                    await serviceClient.UpdateAsync(Heatoutput);
                                }
                            }
                        }

                        if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.PowerOutput)
                        {
                            bool isPowerGroupFilled = !string.IsNullOrEmpty(data.FirstOrDefault().Powertype) &&
                                    data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationspoweroutputs != null &&
                                    data.FirstOrDefault().Annualtotalpoweroutputs > 0;

                            if (isPowerGroupFilled)
                            {
                                relatedquery = new QueryExpression
                                {
                                    EntityName = "desnz_poweroutputs", // Specify the name of the parent entity
                                    ColumnSet = new ColumnSet("desnz_poweroutputsid", "desnz_meter"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("desnz_meter", ConditionOperator.Equal, meterentity.GetAttributeValue<Guid>("desnz_fuelmetersid") )
                                        }
                                    }
                                };

                                EntityCollection relatedPowerModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                                // power output
                                foreach (Entity entity in relatedPowerModelresults.Entities)
                                {
                                    hasPowerOutputs = true;
                                    Entity powerOutput = new Entity("desnz_poweroutputs", entity.GetAttributeValue<Guid>("desnz_poweroutputsid"));

                                    if (data.FirstOrDefault().Powertype == "Generated")
                                        powerOutput["desnz_type"] = new OptionSetValue(0);
                                    else if (data.FirstOrDefault().Powertype == "Exported") powerOutput["desnz_type"] = new OptionSetValue(1);
                                    else if (data.FirstOrDefault().Powertype == "Imported") powerOutput["desnz_type"] = new OptionSetValue(2);

                                    powerOutput["desnz_annualtotal"] = data.FirstOrDefault().Annualtotalpoweroutputs;
                                    powerOutput["desnz_arethereanychpqacalculations"] = data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationspoweroutputs;

                                    ProvidePowerOutputs = true;

                                    await serviceClient.UpdateAsync(powerOutput);
                                }
                            }
                        }
                    }
                }

                Entity resultSubmission = new Entity("desnz_submission", new Guid(submissionId));

                //Energy Inputs
                if (hasEnergyInputs)
                {
                    if (data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsenergyinput != null && data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsenergyinput == true && data.FirstOrDefault().Annualtotalenergyinput != null && data.FirstOrDefault().Annualtotalenergyinput > 0)
                    {
                        resultSubmission["desnz_totalfuelandenergyinputsmwh"] = data.FirstOrDefault().Annualtotalenergyinput;
                    }

                    resultSubmission["desnz_weightedfactorfnxx"] = sumfnx;
                    resultSubmission["desnz_weightedfactorfnxy"] = sumfny;
                }

                //heat outputs
                if (hasHeatOutputs)
                {
                    if (data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsheatoutputs != null && data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationsheatoutputs == true)
                    {
                        if (data.FirstOrDefault().Heattype == "Supplied to site" && data.FirstOrDefault().Annualtotalofheatoutputs != null && data.FirstOrDefault().Annualtotalofheatoutputs > 0)
                        {
                            resultSubmission["desnz_qualifyingheatoutputmwh"] = data.FirstOrDefault().Annualtotalofheatoutputs;
                            resultSubmission["desnz_totalheatexported"] = null;
                        }

                        if (data.FirstOrDefault().Heattype == "Exported" && data.FirstOrDefault().Annualtotalofheatoutputs != null && data.FirstOrDefault().Annualtotalofheatoutputs > 0)
                        {
                            resultSubmission["desnz_totalheatexported"] = data.FirstOrDefault().Annualtotalofheatoutputs;
                            resultSubmission["desnz_qualifyingheatoutputmwh"] = data.FirstOrDefault().Annualtotalofheatoutputs;
                        }
                    }
                }

                //power outputs
                if (hasPowerOutputs)
                {
                    if (data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationspoweroutputs != null && data.FirstOrDefault().ShoulditbeincludedinCHPQAcalculationspoweroutputs == true)
                    {
                        if (data.FirstOrDefault().Powertype == "Generated" && data.FirstOrDefault().Annualtotalpoweroutputs != null && data.FirstOrDefault().Annualtotalpoweroutputs > 0)
                        {
                            resultSubmission["desnz_totalpowergeneratedmwh"] = data.FirstOrDefault().Annualtotalpoweroutputs;
                            resultSubmission["desnz_totalpowerexportedmwh"] = null;
                            resultSubmission["desnz_totalpowerimportedbysitethroughmwh"] = null;

                        }
                        else if (data.FirstOrDefault().Powertype == "Exported" && data.FirstOrDefault().Annualtotalpoweroutputs != null && data.FirstOrDefault().Annualtotalpoweroutputs > 0)
                        {
                            resultSubmission["desnz_totalpowerexportedmwh"] = data.FirstOrDefault().Annualtotalpoweroutputs;
                            resultSubmission["desnz_totalpowergeneratedmwh"] = data.FirstOrDefault().Annualtotalpoweroutputs;
                            resultSubmission["desnz_totalpowerimportedbysitethroughmwh"] = null;
                        }

                        else if (data.FirstOrDefault().Powertype == "Imported" && data.FirstOrDefault().Annualtotalpoweroutputs != null && data.FirstOrDefault().Annualtotalpoweroutputs > 0)
                        {
                            resultSubmission["desnz_totalpowerimportedbysitethroughmwh"] = data.FirstOrDefault().Annualtotalpoweroutputs;
                            resultSubmission["desnz_totalpowergeneratedmwh"] = data.FirstOrDefault().Annualtotalpoweroutputs;
                            resultSubmission["desnz_totalpowerexportedmwh"] = null;
                        }
                    }
                }

                // store hours of operation, SoS, FinancialBenefits and set their flags for Groups / Sections
                if (data.FirstOrDefault().Totalhoursofoperation != null && data.FirstOrDefault().Totalhoursofoperation > 0)
                {
                    resultSubmission["desnz_hoursofoperation"] = data.FirstOrDefault().Totalhoursofoperation;
                    ProvideHoursOfOperation = true;
                }

                if (data.FirstOrDefault().NeedaSOScertificate != null)
                {
                    resultSubmission["desnz_needasoscertificate"] = data.FirstOrDefault().NeedaSOScertificate;
                    SecretaryOfStateExemptionCertificate = true;
                }
                if (data.FirstOrDefault().AnnualCCLValue != null && data.FirstOrDefault().AnnualCCLValue>0)               
                    resultSubmission["desnz_annualclimatechangelevyamount"] = data.FirstOrDefault().AnnualCCLValue;

                if (data.FirstOrDefault().ClimateChangeAgreement != null)
                    resultSubmission["desnz_climatechangeagreement"] = data.FirstOrDefault().ClimateChangeAgreement;

                if (data.FirstOrDefault().AnnualCPSvalue != null&& data.FirstOrDefault().AnnualCPSvalue>0)
                    resultSubmission["desnz_annualcarbonpricesupportamount"] = data.FirstOrDefault().AnnualCPSvalue;

                if (data.FirstOrDefault().AnnualRHAUpliftvalue != null&& data.FirstOrDefault().AnnualRHAUpliftvalue>0)
                    resultSubmission["desnz_annualrenewableheatincentiveupliftamount"] = data.FirstOrDefault().AnnualRHAUpliftvalue;

                if (data.FirstOrDefault().AnnualROCUpliftvalue != null&& data.FirstOrDefault().AnnualROCUpliftvalue>0)
                    resultSubmission["desnz_annualrenewablesobligrationcertificateamount"] = data.FirstOrDefault().AnnualROCUpliftvalue;

                if (data.FirstOrDefault().AnnualCfDwithCHPvalue != null&& data.FirstOrDefault().AnnualCfDwithCHPvalue>0)
                    resultSubmission["desnz_annualcontractsfordifferenceamount"] = data.FirstOrDefault().AnnualCfDwithCHPvalue;

                if (data.FirstOrDefault().Annualbusinessratesreduction != null&& data.FirstOrDefault().Annualbusinessratesreduction>0)
                    resultSubmission["desnz_annualbusinessratesreductionamount"] = data.FirstOrDefault().Annualbusinessratesreduction;

                if (data.FirstOrDefault().AnnualCCLValue != null && data.FirstOrDefault().ClimateChangeAgreement != null && data.FirstOrDefault().AnnualCPSvalue != null
                     && data.FirstOrDefault().AnnualRHAUpliftvalue != null && data.FirstOrDefault().AnnualROCUpliftvalue != null && data.FirstOrDefault().AnnualCfDwithCHPvalue != null && data.FirstOrDefault().Annualbusinessratesreduction != null)
                {
                    ProvideInformationFinancialBenefits = true;
                }

                await serviceClient.UpdateAsync(resultSubmission);


                // update submission with calculations of efficiencies and QI
                await UpdSubmCalcEfficAndQIFun.CalculateAsync(new Guid(submissionId), serviceClient);

                // update Groups status function
                if (ProvideHoursOfOperation)
                {
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(submissionId), (int)SubmissionGroups.GroupType.ProvideHoursOfOperation, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                }
                if (ProvideEnergyInputs)
                {
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(submissionId), (int)SubmissionGroups.GroupType.ProvideEnergyInputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                }
                if (ProvideHeatOutputs)
                {
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(submissionId), (int)SubmissionGroups.GroupType.ProvideHeatOutputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                }
                if (ProvidePowerOutputs)
                {
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(submissionId), (int)SubmissionGroups.GroupType.ProvidePowerOutputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                }
                if (ProvideInformationFinancialBenefits)
                {
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(submissionId), (int)SubmissionGroups.GroupType.ProvideInformationFinancialBenefits, (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, serviceClient, _logger);
                }
                if (SecretaryOfStateExemptionCertificate)
                {
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(submissionId), (int)SubmissionGroups.GroupType.SecretaryOfStateExemptionCertificate, (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, serviceClient, _logger);
                }
                    
                

                ////Log
                Entity bulkimportlog = new Entity("desnz_bulkimportlog");
                bulkimportlog["desnz_name"] = "BulkImportf4s";
                bulkimportlog["desnz_submission"] = new EntityReference("desnz_submission", new Guid(submissionId));
                bulkimportlog["desnz_datetimefinish"] = DateTime.Now;
                bulkimportlog["desnz_output"] = "Success";

                await serviceClient.CreateAsync(bulkimportlog);
            }
        }

        public class f4sModel
        {
            public decimal Totalhoursofoperation { get; set; }
            public string Fuelcategory { get; set; }
            public string Fueltype { get; set; }
            public bool? ShoulditbeincludedinCHPQAcalculationsenergyinput { get; set; }
            public decimal Annualtotalenergyinput { get; set; }
            public string Powertype { get; set; }
            public bool? ShoulditbeincludedinCHPQAcalculationspoweroutputs { get; set; }
            public decimal Annualtotalpoweroutputs { get; set; }
            public string Heattype { get; set; }
            public bool? ShoulditbeincludedinCHPQAcalculationsheatoutputs { get; set; }
            public decimal Annualtotalofheatoutputs { get; set; }
            public bool? NeedaSOScertificate { get; set; }
            public decimal AnnualCCLValue { get; set; }
            public string ClimateChangeAgreement { get; set; }
            public decimal AnnualCPSvalue { get; set; }
            public decimal AnnualRHAUpliftvalue { get; set; }
            public decimal AnnualROCUpliftvalue { get; set; }
            public decimal AnnualCfDwithCHPvalue { get; set; }
            public decimal Annualbusinessratesreduction { get; set; }
        }
        public class ImportFile
        {
            [Required]
            public IFormFile file { get; set; }
            [Required]
            public string? SubmissionId { get; set; }
        }
        
    }
}
