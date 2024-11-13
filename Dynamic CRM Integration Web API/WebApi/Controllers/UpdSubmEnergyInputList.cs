using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdSubmEnergyInputList : ControllerBase
    {
        private readonly ILogger<UpdSubmEnergyInputList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmEnergyInputList(ILogger<UpdSubmEnergyInputList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Energy Input List with the given Energy Input data.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the Submission id</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("UpdSubmEnergyInputList")]
        [SwaggerOperation(Summary = "Update Submission Energy Input List", Description = "Update a Submission Energy Input List with the given Energy Input data.")]
        public async Task<ActionResult<RequestReturnId>> SubmissionMeterList(RequestUpdateSubmissionEnergyInput data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(data.idSubmission), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", new Guid(data.idSubmission));       // get submission

                    RequestReturnId returnId = new RequestReturnId();

                    if (data == null)
                    {
                        reply.message = "data is null";
                        return BadRequest(reply);

                    }
                    if (data.energyInputList == null)
                    {
                        reply.message = "energyInputList is null";
                        return BadRequest(reply);
                    }

                    List<Guid?> energyInputIDs = new List<Guid?>();

                    foreach (RequestEnergyInput energyInput in data.energyInputList)
                    {
                        if (energyInput == null)
                        {
                            reply.message = "energyInputList  has null entry";
                            return BadRequest(reply);
                        }
                        energyInputIDs.Add(energyInput.id);
                    }

                    Guid?[] energyInputArray = energyInputIDs.ToArray();


                    //Get Energy Inputs with ID equal to IDs in energyInputIDs list
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_fuelinputs", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_submission"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_fuelinputsid", ConditionOperator.In, energyInputArray )
                            }
                        }
                    };

                    //EnergyInputs with ID = energyInputIDs list
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    EntityReference submissionReference = null;

                    foreach (Entity energyInput in results.Entities)
                    {
                        if (energyInput.Attributes.Contains("desnz_submission") && energyInput["desnz_submission"] != null)
                        {
                            submissionReference = energyInput["desnz_submission"] as EntityReference;
                        }

                        string submissionName = submissionReference?.Name ?? string.Empty;
                        Guid submissionId = submissionReference == null ? Guid.Empty : submissionReference.Id;

                        if (submissionId != new Guid(data.idSubmission))
                        {
                            return Unauthorized();
                        }

                    }

                    // Energy Input /////////////////
                    foreach (RequestEnergyInput energyInputData in data.energyInputList)
                    {
                        if (energyInputData == null)
                        {
                            reply.message = "energyInputList has null entry";
                            return BadRequest(reply);
                        }
                        
                        Entity energyInput = new Entity("desnz_fuelinputs", energyInputData.id ?? Guid.Empty);       // get current energy Input

                        energyInput["desnz_calculationused"] = energyInputData.includeInCalculations;

                        energyInput["desnz_january"] = energyInputData.january;
                        energyInput["desnz_february"] = energyInputData.february;
                        energyInput["desnz_march"] = energyInputData.march;
                        energyInput["desnz_april"] = energyInputData.april;
                        energyInput["desnz_may"] = energyInputData.may;
                        energyInput["desnz_june"] = energyInputData.june;
                        energyInput["desnz_july"] = energyInputData.july;
                        energyInput["desnz_august"] = energyInputData.august;
                        energyInput["desnz_september"] = energyInputData.september;
                        energyInput["desnz_october"] = energyInputData.october;
                        energyInput["desnz_november"] = energyInputData.november;
                        energyInput["desnz_december"] = energyInputData.december;

                        energyInput["desnz_annualtotal"] = energyInputData.annualTotal;
                        energyInput["desnz_fractionoftotalfuelinput"] = energyInputData.fractionTFI;

                        //give id of fuel Category
                        if (energyInputData.fuelCategory != null)
                        {
                            // fuelCategory relationship
                            energyInput["desnz_fuelcategory"] = new EntityReference("desnz_fuelcategory", energyInputData.fuelCategory.id ?? Guid.Empty);
                        }
                        //give id of fuel
                        if (energyInputData.fuel != null)
                        {
                            // fuel relationship
                            energyInput["desnz_fuel"] = new EntityReference("desnz_fuel", energyInputData.fuel.id ?? Guid.Empty);
                        }

                        if (energyInputData.includeInCalculations == true)     // if used in CHPQA calculations
                        {


                            // get CHPQA policy X Y
                            QueryExpression query = new QueryExpression
                            {
                                EntityName = "desnz_fuelcategoryxy", // Specify the name of the parent entity
                                ColumnSet = new ColumnSet("desnz_x", "desnz_y"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("desnz_category", ConditionOperator.Equal, energyInputData.fuelCategory.id),
                                        new ConditionExpression("desnz_policy", ConditionOperator.Equal, data.policyId),
                                        new ConditionExpression("desnz_beginrangemwe", ConditionOperator.LessEqual, data.chpTotalPowerCapacity/1000), // KW to MW
                                        new ConditionExpression("desnz_endrangemwe", ConditionOperator.GreaterEqual, data.chpTotalPowerCapacity/1000) // KW to MW
                                    }
                                }
                            };

                            EntityCollection fuelcategoryresultsxy = await serviceClient.RetrieveMultipleAsync(query);

                            // for CHPQA policy
                            energyInput["desnz_xvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                            energyInput["desnz_yvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");
                            energyInput["desnz_fnxn"] = ( (decimal)energyInput["desnz_fractionoftotalfuelinput"] / 100 ) * (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");  // fractionTFI is in % so we need to / 100
                            energyInput["desnz_fn_yn"] = ( (decimal)energyInput["desnz_fractionoftotalfuelinput"] / 100 ) * (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y"); // fractionTFI is in % so we need to / 100

                            // if we have a ROCS/CFD policy in the Scheme
                            if(data.rocscfdPolicyId != null)
                            {
                                // get CHPQA policy X Y
                                QueryExpression rocscfdQuery = new QueryExpression
                                {
                                    EntityName = "desnz_fuelcategoryxy", // Specify the name of the parent entity
                                    ColumnSet = new ColumnSet("desnz_x", "desnz_y"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("desnz_category", ConditionOperator.Equal, energyInputData.fuelCategory.id),
                                            new ConditionExpression("desnz_policy", ConditionOperator.Equal, data.rocscfdPolicyId),
                                            new ConditionExpression("desnz_beginrangemwe", ConditionOperator.LessEqual, data.chpTotalPowerCapacity/1000), // KW to MW
                                            new ConditionExpression("desnz_endrangemwe", ConditionOperator.GreaterEqual, data.chpTotalPowerCapacity/1000) // KW to MW
                                        }
                                    }
                                };

                                EntityCollection rocscfdFuelcategoryresultsxy = await serviceClient.RetrieveMultipleAsync(rocscfdQuery);

                                // for ROCS/CFD policy
                                energyInput["desnz_rocsxvalue"] = (decimal)rocscfdFuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                                energyInput["desnz_rocsyvalue"] = (decimal)rocscfdFuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");
                                energyInput["desnz_rocsfnxn"] = ((decimal)energyInput["desnz_fractionoftotalfuelinput"] / 100) * (decimal)rocscfdFuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");  // fractionTFI is in % so we need to / 100
                                energyInput["desnz_rocsfnyn"] = ((decimal)energyInput["desnz_fractionoftotalfuelinput"] / 100) * (decimal)rocscfdFuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y"); // fractionTFI is in % so we need to / 100

                            }

                        }

                        await serviceClient.UpdateAsync(energyInput);
                    }

                    resultSubmission["desnz_totalfuelandenergyinputsmwh"] = data.totalFuelEnergyInputs;
                    resultSubmission["desnz_estimatedtotalfuelandenergyinputsused"] = data.estimatedTotalFuelEnergyPrimeEngines;
                    resultSubmission["desnz_estiamatedtotalfuelandenergyinputs"] = data.estimatedTotalFuelEnergyBoilers;
                    
                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.ProvideEnergyInputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                    
                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(new Guid(data.idSubmission), (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);


                    _logger.LogInformation("Updated Submission Energy Inputs list with new data at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());
                    returnId.id = resultSubmission.Id;

                    // update submission with calculations of efficiencies and QI
                    await UpdSubmCalcEfficAndQIFun.CalculateAsync(returnId.id, serviceClient);

                    return Ok(returnId.id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

        public class RequestUpdateSubmissionEnergyInput
        {
            [Required]
            public string? idSubmission { get; set; }
            
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? totalFuelEnergyInputs { get; set; }
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? estimatedTotalFuelEnergyPrimeEngines { get; set; }   // desnz_estimatedtotalfuelandenergyinputsused
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? estimatedTotalFuelEnergyBoilers { get; set; }   // desnz_estiamatedtotalfuelandenergyinputs

            [Required]
            public Guid? policyId { get; set; }
            public Guid? rocscfdPolicyId { get; set; }
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? chpTotalPowerCapacity { get; set; }         // desnz_chptotalpowercapacity
            [Required]
            public RequestEnergyInput[]? energyInputList { get; set; }

        }

        public class RequestEnergyInput
        {
            public Guid? id { get; set; }                           // desnz_fuelinputsid
            public string? tag { get; set; }                        // desnz_name
            public string? tagNumber { get; set; }                  // desnz_tagnum
            public string? tagPrefix { get; set; }                  // desnz_tagprefix
            public string? userTag { get; set; }                    // desnz_tag
            public string? serialNumber { get; set; }               // desnz_serialnumber
            public RequestInputsOutputsMeter? meter { get; set; }       // desnz_meter
            public ReplyInputsOutputsFuelCategory? fuelCategory { get; set; }         // desnz_fuelcategory
            public ReplyFuel? fuel { get; set; }                         // desnz_fuel
            [Range(0, int.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public int? year { get; set; }                          // desnz_year1

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? january { get; set; }                   // desnz_january

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? february { get; set; }                  // desnz_february

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? march { get; set; }                     // desnz_march

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? april { get; set; }                     // desnz_april

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? may { get; set; }                       // desnz_may

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? june { get; set; }                      // desnz_june

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? july { get; set; }                      // desnz_july

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? august { get; set; }                    // desnz_august

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? september { get; set; }                 // desnz_september

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? october { get; set; }                   // desnz_october

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? november { get; set; }                  // desnz_november

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? december { get; set; }                  // desnz_december

            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? annualTotal { get; set; }               // desnz_annualtotal
            //public decimal? xValue { get; set; }                    // desnz_xvalue
            //public decimal? yValue { get; set; }                    // desnz_yvalue
            //public decimal? fnX { get; set; }                       // desnz_fnxn
            //public decimal? fnY { get; set; }                       // desnz_fn_yn
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? fractionTFI { get; set; }                // desnz_fractionoftotalfuelinput
            public bool? includeInCalculations { get; set; }         // desnz_calculationused
        }

    }
}
