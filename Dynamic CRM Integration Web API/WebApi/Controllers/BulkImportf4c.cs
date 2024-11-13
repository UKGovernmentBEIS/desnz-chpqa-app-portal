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
    public class BulkImportf4c : ControllerBase
    {
        private readonly ILogger<BulkImportf4s> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        private const long MaxFileSize = 50 * 1024 * 1024;

        public enum SubGroupType
        {
            ProvideHoursOfOperation = SubmissionGroups.GroupType.ProvideHoursOfOperation,
            ProvideEnergyInputs = SubmissionGroups.GroupType.ProvideEnergyInputs,
            ProvidePowerOutputs = SubmissionGroups.GroupType.ProvidePowerOutputs,
            ProvideHeatOutputs = SubmissionGroups.GroupType.ProvideHeatOutputs,
            SubmitToAssessor = SubmissionGroups.GroupType.SubmitToAssessor,
        }

        bool ProvideHoursOfOperation = false;
        bool ProvideEnergyInputs = false;
        bool ProvidePowerOutputs = false;
        bool ProvideHeatOutputs = false;

        decimal EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers = 0;
        decimal EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers = 0;
        decimal EstimatedTotalHeatOutputUsedInthePrimeMovers = 0;
        decimal EstimatedTotalHeatOutputUsedIntheBoilers = 0;
        public BulkImportf4c(ILogger<BulkImportf4s> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Bulk Import of F4C file.
        /// </summary>
        /// <response code="200">If the file was imported successfully</response>
        /// <response code="400">If no file was imported or wrong type of file (different than ".xlsx" or "xls")</response>
        /// <response code="500">If a file with all cells empty was uploaded or If there is a server error</response>
        [ProducesResponseType(typeof(ReplyMessage), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("BulkImportf4c")]
        public async Task<IActionResult> BulkImportExcelf4c(ImportFile importdata)
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
                    return StatusCode(StatusCodes.Status400BadRequest, reply.message);
                }

                var fileExtension = Path.GetExtension(importdata.file.FileName);
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    reply = new ReplyMessage();
                    reply.message = "The selected file must be an Excel file.";
                    return StatusCode(StatusCodes.Status400BadRequest, reply);
                }

                // Check if the file exceeds the maximum size
                if (importdata.file.Length > MaxFileSize)
                {
                    reply.message = "The selected file size can only be up to 50 MB.";
                    return BadRequest(reply);
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
                        CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                        await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                        await LogErrorAsync(ex, submissionId);
                        _logger.LogError(ex, "Error during task execution for SubmissionId: {SubmissionId}", submissionId);
                        reply.message = "Internal Server Error Occurred";

                    }
                    finally
                    {
                        memoryStream.Dispose();
                    }
                });

                if (reply.message == "Internal Server Error Occurred") return StatusCode(StatusCodes.Status500InternalServerError, reply);
                else
                {
                    reply.message = "Import Finished Successfully";
                    return Ok(reply);
                }
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
                    ["desnz_name"] = "BulkImportf4c",
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
                var data = new List<f4cModel>();

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
                        var record = new f4cModel();
                        foreach (var prop in typeof(f4cModel).GetProperties())
                        {
                            string Filter(string input) => new string(input.Where(char.IsLetterOrDigit).ToArray()).ToLower();
                            var colInfo = columnInfo.SingleOrDefault(c => Filter(c.ColumnName) == Filter(prop.Name));

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
        private async Task ProcessCRMData(IServiceClientFactory serviceClientFactory, List<f4cModel> data, string submissionId)
        {
            decimal sumfnx = 0;
            decimal sumfny = 0;
            decimal totalfuelandenergyinputsmwh = 0;
            decimal qualifyingheatoutputmwh = 0;
            decimal totalheatexported = 0;
            decimal totalpowergeneratedmwh = 0;
            decimal totalpowerexportedmwh = 0;
            decimal totalpowerimportedbysitethroughmwh = 0;

            decimal totalFuelEnergyInputs = 0;

            using (var serviceClient = serviceClientFactory.CreateServiceClient())
            {

                QueryExpression relatedquery = new QueryExpression
                {
                    EntityName = "desnz_fuelmeters",
                    ColumnSet = new ColumnSet("desnz_measuretype", "desnz_fuelmetersid", "desnz_tagnum"),
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
                        var currentDataRow = data.FirstOrDefault(x => x.MeterTagNumber == meterentity.GetAttributeValue<string>("desnz_tagnum"));

                        if (currentDataRow != null)
                        {
                            if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.EnergyInput)
                            {
                                decimal AnnualTotalOfEnergyInputs = new decimal[]
                                {
                                    currentDataRow.EnergyInputsJanuary,
                                    currentDataRow.EnergyInputsFebruary,
                                    currentDataRow.EnergyInputsMarch,
                                    currentDataRow.EnergyInputsApril,
                                    currentDataRow.EnergyInputsMay,
                                    currentDataRow.EnergyInputsJune,
                                    currentDataRow.EnergyInputsJuly,
                                    currentDataRow.EnergyInputsAugust,
                                    currentDataRow.EnergyInputsSeptember,
                                    currentDataRow.EnergyInputsOctober,
                                    currentDataRow.EnergyInputsNovember,
                                    currentDataRow.EnergyInputsDecember
                                }.Sum();

                                if (currentDataRow.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs == true)
                                {
                                    totalFuelEnergyInputs += AnnualTotalOfEnergyInputs;
                                }
                            }
                        }
                    }
                }

                if (relatedmeterresults.Entities.Count > 0)
                {
                    foreach (Entity meterentity in relatedmeterresults.Entities)
                    {
                        var currentDataRow = data.FirstOrDefault(x => x.MeterTagNumber == meterentity.GetAttributeValue<string>("desnz_tagnum"));

                        if (currentDataRow != null)
                        {

                            if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.EnergyInput)
                            {
                                bool isFuelGroupFilled = !string.IsNullOrEmpty(currentDataRow.FuelCategory) &&
                                !string.IsNullOrEmpty(currentDataRow.FuelType) &&
                                currentDataRow.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs != null;

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
                                                new ConditionExpression("desnz_category", ConditionOperator.Equal, fuelcategoryresults.Entities.FirstOrDefault(a => a.GetAttributeValue<string>("desnz_name") == currentDataRow.FuelCategory).GetAttributeValue<Guid>("desnz_fuelcategoryid")),
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

                                    // energy inputs
                                    foreach (Entity entity in relatedModelresults.Entities)
                                    {
                                        hasEnergyInputs = true;

                                        var meter = entity["desnz_meter"] as EntityReference;

                                        Entity energyInput = new Entity("desnz_fuelinputs", entity.GetAttributeValue<Guid>("desnz_fuelinputsid"));

                                        energyInput["desnz_calculationused"] = currentDataRow.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs;

                                        energyInput["desnz_january"] = currentDataRow.EnergyInputsJanuary;
                                        energyInput["desnz_february"] = currentDataRow.EnergyInputsFebruary;
                                        energyInput["desnz_march"] = currentDataRow.EnergyInputsMarch;
                                        energyInput["desnz_april"] = currentDataRow.EnergyInputsApril;
                                        energyInput["desnz_may"] = currentDataRow.EnergyInputsMay;
                                        energyInput["desnz_june"] = currentDataRow.EnergyInputsJune;
                                        energyInput["desnz_july"] = currentDataRow.EnergyInputsJuly;
                                        energyInput["desnz_august"] = currentDataRow.EnergyInputsAugust;
                                        energyInput["desnz_september"] = currentDataRow.EnergyInputsSeptember;
                                        energyInput["desnz_october"] = currentDataRow.EnergyInputsOctober;
                                        energyInput["desnz_november"] = currentDataRow.EnergyInputsNovember;
                                        energyInput["desnz_december"] = currentDataRow.EnergyInputsDecember;

                                        decimal AnnualTotalOfEnergyInputs = new decimal[]
                                        {
                                            currentDataRow.EnergyInputsJanuary,
                                            currentDataRow.EnergyInputsFebruary,
                                            currentDataRow.EnergyInputsMarch,
                                            currentDataRow.EnergyInputsApril,
                                            currentDataRow.EnergyInputsMay,
                                            currentDataRow.EnergyInputsJune,
                                            currentDataRow.EnergyInputsJuly,
                                            currentDataRow.EnergyInputsAugust,
                                            currentDataRow.EnergyInputsSeptember,
                                            currentDataRow.EnergyInputsOctober,
                                            currentDataRow.EnergyInputsNovember,
                                            currentDataRow.EnergyInputsDecember
                                        }.Sum();

                                        decimal? fractionTFI = 0.0m;
                                        if (currentDataRow.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs == true)
                                        {
                                            fractionTFI = AnnualTotalOfEnergyInputs / totalFuelEnergyInputs;
                                            energyInput["desnz_fnxn"] = fractionTFI * (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                                            energyInput["desnz_fn_yn"] = fractionTFI * (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");

                                        }
                                        else
                                        {
                                            energyInput["desnz_fnxn"] = 0;
                                            energyInput["desnz_fn_yn"] = 0;
                                        }

                                        energyInput["desnz_fractionoftotalfuelinput"] = fractionTFI * 100;

                                        energyInput["desnz_annualtotal"] = AnnualTotalOfEnergyInputs;
                                        energyInput["desnz_xvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                                        energyInput["desnz_yvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");

                                        energyInput["desnz_fuelcategory"] = new EntityReference("desnz_fuelcategory", fuelcategoryresults.Entities.FirstOrDefault(a => a.GetAttributeValue<string>("desnz_name") == currentDataRow.FuelCategory).GetAttributeValue<Guid>("desnz_fuelcategoryid"));
                                        energyInput["desnz_fuel"] = new EntityReference("desnz_fuel", fuelresults.Entities.FirstOrDefault(a => a.GetAttributeValue<string>("desnz_name") == currentDataRow.FuelType).GetAttributeValue<Guid>("desnz_fuelid"));

                                        if (currentDataRow.ShouldItBeIncludedInCHPQAcalculationsEnergyInputs == true)
                                        {
                                            sumfnx += (decimal)energyInput["desnz_fnxn"];
                                            sumfny += (decimal)energyInput["desnz_fn_yn"];
                                            totalfuelandenergyinputsmwh += AnnualTotalOfEnergyInputs;
                                        }

                                        EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers = EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers == 0 ? currentDataRow.EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers : EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers;
                                        EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers = EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers == 0 ? currentDataRow.EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers : EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers;

                                        ProvideEnergyInputs = true;

                                        await serviceClient.UpdateAsync(energyInput);
                                    }

                                }
                            }

                            if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.HeatOutput)
                            {
                                bool isHeatRejectionGroupFilled = !string.IsNullOrEmpty(currentDataRow.HeatType) &&
                                currentDataRow.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs != null;

                                if (isHeatRejectionGroupFilled)
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

                                    // heat outputs
                                    foreach (Entity entity in relatedHeatModelresults.Entities)
                                    {
                                        hasHeatOutputs = true;
                                        Entity Heatoutput = new Entity("desnz_heatoutput", entity.GetAttributeValue<Guid>("desnz_heatoutputid"));

                                        Heatoutput["desnz_january"] = currentDataRow.HeatOutputsJanuary;
                                        Heatoutput["desnz_february"] = currentDataRow.HeatOutputsFebruary;
                                        Heatoutput["desnz_march"] = currentDataRow.HeatOutputsMarch;
                                        Heatoutput["desnz_april"] = currentDataRow.HeatOutputsApril;
                                        Heatoutput["desnz_may"] = currentDataRow.HeatOutputsMay;
                                        Heatoutput["desnz_june"] = currentDataRow.HeatOutputsJune;
                                        Heatoutput["desnz_july"] = currentDataRow.HeatOutputsJuly;
                                        Heatoutput["desnz_august"] = currentDataRow.HeatOutputsAugust;
                                        Heatoutput["desnz_september"] = currentDataRow.HeatOutputsDecember;
                                        Heatoutput["desnz_october"] = currentDataRow.HeatOutputsOctober;
                                        Heatoutput["desnz_november"] = currentDataRow.HeatOutputsNovember;
                                        Heatoutput["desnz_december"] = currentDataRow.HeatOutputsDecember;

                                        decimal AnnualTotalOfHeatOutputs = new decimal[]
                                        {
                                            currentDataRow.HeatOutputsJanuary,
                                            currentDataRow.HeatOutputsFebruary,
                                            currentDataRow.HeatOutputsMarch,
                                            currentDataRow.HeatOutputsApril,
                                            currentDataRow.HeatOutputsMay,
                                            currentDataRow.HeatOutputsJune,
                                            currentDataRow.HeatOutputsJuly,
                                            currentDataRow.HeatOutputsAugust,
                                            currentDataRow.HeatOutputsSeptember,
                                            currentDataRow.HeatOutputsOctober,
                                            currentDataRow.HeatOutputsNovember,
                                            currentDataRow.HeatOutputsDecember
                                        }.Sum();

                                        Heatoutput["desnz_arethereanychpqacalculations"] = currentDataRow.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs;

                                        if (currentDataRow.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs != null && currentDataRow.ShouldItBeIncludedInCHPQAcalculationsHeatOutputs == true)
                                        {
                                            if (currentDataRow.HeatType == "Supplied to site")
                                            {
                                                qualifyingheatoutputmwh += AnnualTotalOfHeatOutputs;
                                            }

                                            if (currentDataRow.HeatType == "Exported")
                                            {
                                                qualifyingheatoutputmwh += AnnualTotalOfHeatOutputs;
                                                totalheatexported += AnnualTotalOfHeatOutputs;
                                            }
                                        }

                                        Heatoutput["desnz_annualtotal"] = AnnualTotalOfHeatOutputs;

                                        if (currentDataRow.HeatType == "Supplied to site")
                                            Heatoutput["desnz_type"] = new OptionSetValue(0);
                                        else if (currentDataRow.HeatType == "Exported") Heatoutput["desnz_type"] = new OptionSetValue(1);

                                        EstimatedTotalHeatOutputUsedInthePrimeMovers = EstimatedTotalHeatOutputUsedInthePrimeMovers == 0 ? currentDataRow.EstimatedTotalHeatOutputUsedInthePrimeMovers : EstimatedTotalHeatOutputUsedInthePrimeMovers;
                                        EstimatedTotalHeatOutputUsedIntheBoilers = EstimatedTotalHeatOutputUsedIntheBoilers == 0 ? currentDataRow.EstimatedTotalHeatOutputUsedIntheBoilers : EstimatedTotalHeatOutputUsedIntheBoilers;

                                        ProvideHeatOutputs = true;
                                        await serviceClient.UpdateAsync(Heatoutput);
                                    }
                                }
                            }

                            if (meterentity.GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.PowerOutput)
                            {
                                bool isPowerGroupFilled = !string.IsNullOrEmpty(currentDataRow.PowerType) &&
                                currentDataRow.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs != null;

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

                                    // power outputs
                                    foreach (Entity entity in relatedPowerModelresults.Entities)
                                    {
                                        hasPowerOutputs = true;

                                        Entity powerOutput = new Entity("desnz_poweroutputs", entity.GetAttributeValue<Guid>("desnz_poweroutputsid"));

                                        if (currentDataRow.PowerType == "Generated")
                                            powerOutput["desnz_type"] = new OptionSetValue(0);
                                        else if (currentDataRow.PowerType == "Exported") powerOutput["desnz_type"] = new OptionSetValue(1);
                                        else if (currentDataRow.PowerType == "Imported") powerOutput["desnz_type"] = new OptionSetValue(2);


                                        powerOutput["desnz_january"] = currentDataRow.PowerOutputsJanuary;
                                        powerOutput["desnz_february"] = currentDataRow.PowerOutputsFebruary;
                                        powerOutput["desnz_march"] = currentDataRow.PowerOutputsMarch;
                                        powerOutput["desnz_april"] = currentDataRow.PowerOutputsApril;
                                        powerOutput["desnz_may"] = currentDataRow.PowerOutputsMay;
                                        powerOutput["desnz_june"] = currentDataRow.PowerOutputsJune;
                                        powerOutput["desnz_july"] = currentDataRow.PowerOutputsJuly;
                                        powerOutput["desnz_august"] = currentDataRow.PowerOutputsAugust;
                                        powerOutput["desnz_september"] = currentDataRow.PowerOutputsSeptember;
                                        powerOutput["desnz_october"] = currentDataRow.PowerOutputsOctober;
                                        powerOutput["desnz_november"] = currentDataRow.PowerOutputsNovember;
                                        powerOutput["desnz_december"] = currentDataRow.PowerOutputsDecember;

                                        decimal AnnualTotalOfPowerOutputs = new decimal[]
                                        {
                                            currentDataRow.PowerOutputsJanuary,
                                            currentDataRow.PowerOutputsFebruary,
                                            currentDataRow.PowerOutputsMarch,
                                            currentDataRow.PowerOutputsApril,
                                            currentDataRow.PowerOutputsMay,
                                            currentDataRow.PowerOutputsJune,
                                            currentDataRow.PowerOutputsJuly,
                                            currentDataRow.PowerOutputsAugust,
                                            currentDataRow.PowerOutputsSeptember,
                                            currentDataRow.PowerOutputsOctober,
                                            currentDataRow.PowerOutputsNovember,
                                            currentDataRow.PowerOutputsDecember
                                        }.Sum();

                                        powerOutput["desnz_annualtotal"] = AnnualTotalOfPowerOutputs;
                                        powerOutput["desnz_arethereanychpqacalculations"] = currentDataRow.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs;

                                        if (currentDataRow.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs != null && currentDataRow.ShouldItBeIncludedInCHPQAcalculationsPowerOutputs == true)
                                        {
                                            if (currentDataRow.PowerType == "Generated")
                                            {
                                                totalpowergeneratedmwh += AnnualTotalOfPowerOutputs;
                                            }
                                            else if (currentDataRow.PowerType == "Imported")
                                            {
                                                totalpowerexportedmwh += AnnualTotalOfPowerOutputs;
                                                totalpowergeneratedmwh += AnnualTotalOfPowerOutputs;
                                            }

                                            else if (currentDataRow.PowerType == "Exported")
                                            {
                                                totalpowerimportedbysitethroughmwh += AnnualTotalOfPowerOutputs;
                                                totalpowergeneratedmwh += AnnualTotalOfPowerOutputs;
                                            }
                                        }

                                        ProvidePowerOutputs = true;

                                        await serviceClient.UpdateAsync(powerOutput);
                                    }
                                }
                            }
                        }
                    }
                }

                Entity resultSubmission = new Entity("desnz_submission", new Guid(submissionId));

                if (hasEnergyInputs)
                {
                    //Energy Inputs              
                    resultSubmission["desnz_totalfuelandenergyinputsmwh"] = totalfuelandenergyinputsmwh;
                    resultSubmission["desnz_weightedfactorfnxx"] = sumfnx;
                    resultSubmission["desnz_weightedfactorfnxy"] = sumfny;
                    resultSubmission["desnz_estimatedtotalfuelandenergyinputsused"] = EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers;
                    resultSubmission["desnz_estiamatedtotalfuelandenergyinputs"] = EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers;
                }

                if (hasHeatOutputs)
                {
                    //heat outputs
                    resultSubmission["desnz_qualifyingheatoutputmwh"] = qualifyingheatoutputmwh;
                    resultSubmission["desnz_totalheatexported"] = totalheatexported;
                    resultSubmission["desnz_estimatedqualifyheatoutputfromprimemover"] = EstimatedTotalHeatOutputUsedInthePrimeMovers;
                    resultSubmission["desnz_estimatedqualifiedheatoutputfromtheboilers"] = EstimatedTotalHeatOutputUsedIntheBoilers;
                }

                if (hasPowerOutputs)
                {
                    //power outputs              
                    resultSubmission["desnz_totalpowergeneratedmwh"] = totalpowergeneratedmwh;
                    resultSubmission["desnz_totalpowerexportedmwh"] = totalpowerexportedmwh;
                    resultSubmission["desnz_totalpowerimportedbysitethroughmwh"] = totalpowerimportedbysitethroughmwh;
                }

                // hour of operations and months
                if (data.FirstOrDefault().Totalhoursofoperation != null && data.FirstOrDefault().Totalhoursofoperation > 0)
                {
                    resultSubmission["desnz_hoursofoperation"] = data.FirstOrDefault().Totalhoursofoperation;
                    ProvideHoursOfOperation = true;
                }
                if (data.FirstOrDefault().Monthsthisperiodcover != null && data.FirstOrDefault().Monthsthisperiodcover > 0)
                {
                    resultSubmission["desnz_months"] = data.FirstOrDefault().Monthsthisperiodcover;
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
                    
                
                

                ////Log
                Entity bulkimportlog = new Entity("desnz_bulkimportlog");
                bulkimportlog["desnz_name"] = "BulkImportf4c";
                bulkimportlog["desnz_submission"] = new EntityReference("desnz_submission", new Guid(submissionId));
                bulkimportlog["desnz_datetimefinish"] = DateTime.Now;
                bulkimportlog["desnz_output"] = "Success";

                await serviceClient.CreateAsync(bulkimportlog);
            }
        }

        public class f4cModel
        {
            public string? MeterTagNumber { get; set; }
            public decimal Totalhoursofoperation { get; set; }
            public int Monthsthisperiodcover { get; set; }
            public string FuelCategory { get; set; }
            public string FuelType { get; set; }
            public bool? ShouldItBeIncludedInCHPQAcalculationsEnergyInputs { get; set; }
            public decimal EnergyInputsJanuary { get; set; }
            public decimal EnergyInputsFebruary { get; set; }
            public decimal EnergyInputsMarch { get; set; }
            public decimal EnergyInputsApril { get; set; }
            public decimal EnergyInputsMay { get; set; }
            public decimal EnergyInputsJune { get; set; }
            public decimal EnergyInputsJuly { get; set; }
            public decimal EnergyInputsAugust { get; set; }
            public decimal EnergyInputsSeptember { get; set; }
            public decimal EnergyInputsOctober { get; set; }
            public decimal EnergyInputsNovember { get; set; }
            public decimal EnergyInputsDecember { get; set; }
            public decimal EstimatedTotalFuelAndEnergyInputsUsedInthePrimeMovers { get; set; }
            public decimal EstimatedTotalFuelAndEnergyInputsUsedIntheBoilers { get; set; }
            public string PowerType { get; set; }
            public bool? ShouldItBeIncludedInCHPQAcalculationsPowerOutputs { get; set; }
            public decimal PowerOutputsJanuary { get; set; }
            public decimal PowerOutputsFebruary { get; set; }
            public decimal PowerOutputsMarch { get; set; }
            public decimal PowerOutputsApril { get; set; }
            public decimal PowerOutputsMay { get; set; }
            public decimal PowerOutputsJune { get; set; }
            public decimal PowerOutputsJuly { get; set; }
            public decimal PowerOutputsAugust { get; set; }
            public decimal PowerOutputsSeptember { get; set; }
            public decimal PowerOutputsOctober { get; set; }
            public decimal PowerOutputsNovember { get; set; }
            public decimal PowerOutputsDecember { get; set; }
            public string HeatType { get; set; }
            public bool? ShouldItBeIncludedInCHPQAcalculationsHeatOutputs { get; set; }
            public decimal HeatOutputsJanuary { get; set; }
            public decimal HeatOutputsFebruary { get; set; }
            public decimal HeatOutputsMarch { get; set; }
            public decimal HeatOutputsApril { get; set; }
            public decimal HeatOutputsMay { get; set; }
            public decimal HeatOutputsJune { get; set; }
            public decimal HeatOutputsJuly { get; set; }
            public decimal HeatOutputsAugust { get; set; }
            public decimal HeatOutputsSeptember { get; set; }
            public decimal HeatOutputsOctober { get; set; }
            public decimal HeatOutputsNovember { get; set; }
            public decimal HeatOutputsDecember { get; set; }
            public decimal EstimatedTotalHeatOutputUsedInthePrimeMovers { get; set; }
            public decimal EstimatedTotalHeatOutputUsedIntheBoilers { get; set; }
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
