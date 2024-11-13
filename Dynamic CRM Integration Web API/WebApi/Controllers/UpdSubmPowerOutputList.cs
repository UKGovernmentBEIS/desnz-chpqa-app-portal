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
    public class UpdSubmPowerOutputList : ControllerBase
    {
        private readonly ILogger<UpdSubmPowerOutputList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmPowerOutputList(ILogger<UpdSubmPowerOutputList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Power Output List with the given Power Output data.
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
        [HttpPost("UpdSubmPowerOutputList")]
        [SwaggerOperation(Summary = "Update Submission Power Output List", Description = "Update a Submission Power Output List with the given Power Output data.")]
        public async Task<ActionResult<RequestReturnId>> SubmissionMeterList(RequestUpdateSubmissionPowerOutput data)
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
                    // Power Output /////////////////
                    if (data.powerOutputList == null)
                    {
                        reply.message = "powerOutputList is null";
                        return BadRequest(reply);
                    }

                    List<Guid?> powerOutputIDs = new List<Guid?>();

                    foreach (RequestPowerOutput powerOutput in data.powerOutputList)
                    {
                        if (powerOutput == null)
                        {
                            reply.message = "powerOutputList  has null entry";
                            return BadRequest(reply);
                        }
                        powerOutputIDs.Add(powerOutput.id);
                    }

                    Guid?[] powerOutputIDsArray = powerOutputIDs.ToArray();

                    //Get Power Outputs with ID equal to IDs in powerOutputIDs list
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_poweroutputs", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_submission"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_poweroutputsid", ConditionOperator.In, powerOutputIDsArray)
                            }
                        }
                    };

                    //PowerOutputs with ID = powerOutputIDs list
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    EntityReference submissionReference = null;

                    foreach (Entity powerOutput in results.Entities)
                    {
                        if (powerOutput.Attributes.Contains("desnz_submission") && powerOutput["desnz_submission"] != null)
                        {
                            submissionReference = powerOutput["desnz_submission"] as EntityReference;
                        }

                        string submissionName = submissionReference?.Name ?? string.Empty;
                        Guid submissionId = submissionReference == null ? Guid.Empty : submissionReference.Id;

                        if (submissionId != new Guid(data.idSubmission))
                        {
                            return Unauthorized();
                        }

                    }

                    foreach (RequestPowerOutput powerOutputData in data.powerOutputList)
                    {
                        if (powerOutputData == null)
                        {
                            reply.message = "powerOutputList has null entry";
                            return BadRequest(reply);
                        }
                        
                        Entity powerOutput = new Entity("desnz_poweroutputs", powerOutputData.id ?? Guid.Empty);       // get current power output

                        powerOutput["desnz_arethereanychpqacalculations"] = powerOutputData.includeInCalculations;

                        powerOutput["desnz_january"] = powerOutputData.january;
                        powerOutput["desnz_february"] = powerOutputData.february;
                        powerOutput["desnz_march"] = powerOutputData.march;
                        powerOutput["desnz_april"] = powerOutputData.april;
                        powerOutput["desnz_may"] = powerOutputData.may;
                        powerOutput["desnz_june"] = powerOutputData.june;
                        powerOutput["desnz_july"] = powerOutputData.july;
                        powerOutput["desnz_august"] = powerOutputData.august;
                        powerOutput["desnz_september"] = powerOutputData.september;
                        powerOutput["desnz_october"] = powerOutputData.october;
                        powerOutput["desnz_november"] = powerOutputData.november;
                        powerOutput["desnz_december"] = powerOutputData.december;

                        powerOutput["desnz_type"] = new OptionSetValue(powerOutputData.powerType ?? 0);
                        powerOutput["desnz_annualtotal"] = powerOutputData.annualTotal;

                        await serviceClient.UpdateAsync(powerOutput);

                    }

                    resultSubmission["desnz_totalpowergeneratedmwh"] = data.totalPowerGenerated;
                    resultSubmission["desnz_totalpowerexportedmwh"] = data.totalPowerExported;
                    resultSubmission["desnz_totalpowerimportedbysitethroughmwh"] = data.totalPowerImported;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);
                    //await serviceClient.UpdateAsync(resultGroup);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.ProvidePowerOutputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(new Guid(data.idSubmission), (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);


                    _logger.LogInformation("Updated Submission Power Output list with new data at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());
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

        public class RequestUpdateSubmissionPowerOutput
        {

            [Required]
            public string? idSubmission { get; set; }
            //[Required]
           // public string? idGroup { get; set; }
            //[Required]
            //public int? status { get; set; }
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? totalPowerGenerated { get; set; }    // desnz_totalpowergeneratedmwh
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? totalPowerExported { get; set; }    // desnz_totalpowerexportedmwh
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? totalPowerImported { get; set; }    // desnz_totalpowerimportedbysitethroughmwh

            [Required]
            public RequestPowerOutput[]? powerOutputList { get; set; } 

        }

        public class RequestPowerOutput
        {
            public Guid? id { get; set; }                           // desnz_poweroutputsid
            public string? tag { get; set; }                        // desnz_name
            public string? tagNumber { get; set; }                  // desnz_tagnum
            public string? tagPrefix { get; set; }                  // desnz_tagprefix
            public string? userTag { get; set; }                    // desnz_tag
            public string? serialNumber { get; set; }               // desnz_serialnumber
            public string? diagramReferenceNumber { get; set; }     // desnz_diagramreferencenumber
            public bool? includeInCalculations { get; set; }        // desnz_arethereanychpqacalculations
            public int? powerType { get; set; }                     // desnz_type
            public ReplyEquipmentSubType? meterType { get; set; }    // desnz_metertype
            public ReplyInputsOutputsMeter? meter { get; set; }      // desnz_meter
            [Range(0, int.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public int? year { get; set; }                          // desnz_year
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
        }

    }
}
