using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Functions;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class UpdSubmHeatOutputList : ControllerBase
    {
        private readonly ILogger<UpdSubmHeatOutputList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmHeatOutputList(ILogger<UpdSubmHeatOutputList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Heat Output List with the given Heat Output data.
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
        [HttpPost("UpdSubmHeatOutputList")]
        [SwaggerOperation(Summary = "Update Submission Heat Output List", Description = "Update a Submission Heat Output List with the given Heat Output data.")]
        public async Task<ActionResult<RequestReturnId>> SubmissionMeterList(RequestUpdateSubmissionHeatOutput data)
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
                    // Heat Output /////////////////
                    if (data.heatOutputList == null)
                    {
                        reply.message = "heatOutputList is null";
                        return BadRequest(reply);
                    }

                    List<Guid?> heatOutputIds = new List<Guid?>();

                    //Adding all heatOutputIDs into List
                    foreach (RequestHeatOutput heatOutputData in data.heatOutputList)
                    {

                        if (heatOutputData == null)
                        {
                            reply.message = "heatOutputList  has null entry";
                            return BadRequest(reply);
                        }

                        heatOutputIds.Add(heatOutputData.id);
                    }

                    Guid?[] heatOutputIDsArray = heatOutputIds.ToArray();

                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_heatoutput", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_submission"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_heatoutputid", ConditionOperator.In, heatOutputIDsArray )
                            }
                        }
                    };

                    //Heatoutputs with ID = heatOutputsIds list
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    EntityReference submissionReference = null;

                    foreach (Entity heatOutput in results.Entities)
                    {
                        if (heatOutput.Attributes.Contains("desnz_submission") && heatOutput["desnz_submission"] != null)
                        {
                            submissionReference = heatOutput["desnz_submission"] as EntityReference;
                        }

                        string submissionName = submissionReference?.Name ?? string.Empty;
                        Guid submissionId = submissionReference == null ? Guid.Empty : submissionReference.Id;

                        if (submissionId != new Guid (data.idSubmission) )
                        {
                            return Unauthorized();
                        }

                    }

                    foreach (RequestHeatOutput heatOutputData in data.heatOutputList)
                    {
                        if (heatOutputData == null)
                        {
                            reply.message = "heatOutputList  has null entry";
                            return BadRequest(reply);
                        }

                        Entity heatOutput = new Entity("desnz_heatoutput", heatOutputData.id ?? Guid.Empty);       // get current heat output

                        heatOutput["desnz_arethereanychpqacalculations"] = heatOutputData.includeInCalculations;

                        heatOutput["desnz_january"] = heatOutputData.january;
                        heatOutput["desnz_february"] = heatOutputData.february;
                        heatOutput["desnz_march"] = heatOutputData.march;
                        heatOutput["desnz_april"] = heatOutputData.april;
                        heatOutput["desnz_may"] = heatOutputData.may;
                        heatOutput["desnz_june"] = heatOutputData.june;
                        heatOutput["desnz_july"] = heatOutputData.july;
                        heatOutput["desnz_august"] = heatOutputData.august;
                        heatOutput["desnz_september"] = heatOutputData.september;
                        heatOutput["desnz_october"] = heatOutputData.october;
                        heatOutput["desnz_november"] = heatOutputData.november;
                        heatOutput["desnz_december"] = heatOutputData.december;

                        heatOutput["desnz_type"] = new OptionSetValue(heatOutputData.heatType ?? 0);
                        heatOutput["desnz_annualtotal"] = heatOutputData.annualTotal;

                        await serviceClient.UpdateAsync(heatOutput);

                    }
                    resultSubmission["desnz_qualifyingheatoutputmwh"] = data.qualifyingHeatOutput;
                    resultSubmission["desnz_totalheatexported"] = data.totalHeatExported;
                    resultSubmission["desnz_estimatedqualifyheatoutputfromprimemover"] = data.estimatedTotalHeatOutputUsedInthePrimeMovers;
                    resultSubmission["desnz_estimatedqualifiedheatoutputfromtheboilers"] = data.estimatedTotalHeatOutputUsedIntheBoilers;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.ProvideHeatOutputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(new Guid(data.idSubmission), (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                    _logger.LogInformation("Updated Submission Heat Output list with new data at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());
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

        public class RequestUpdateSubmissionHeatOutput
        {
            [Required]
            public string? idSubmission { get; set; }
            //[Required]
            //public string? idGroup { get; set; }
           // [Required]
            // int? status { get; set; }
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? qualifyingHeatOutput { get; set; }      // desnz_qualifyingheatoutputmwh
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? totalHeatExported { get; set; }         // desnz_totalheatexported
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? estimatedTotalHeatOutputUsedInthePrimeMovers { get; set; }
            
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? estimatedTotalHeatOutputUsedIntheBoilers { get; set; }
            [Required]
            public RequestHeatOutput[]? heatOutputList { get; set; }

        }

        public class RequestHeatOutput
        {
            public Guid? id { get; set; }                           // desnz_heatoutputid
            public string? tag { get; set; }                        // desnz_name
            public string? tagNumber { get; set; }                  // desnz_tagnum
            public string? tagPrefix { get; set; }                  // desnz_tagprefix
            public string? userTag { get; set; }                    // desnz_tag
            public string? serialNumber { get; set; }               // desnz_serialnumber
            public bool? includeInCalculations { get; set; }        // desnz_arethereanychpqacalculations
            public int? heatType { get; set; }                      // desnz_type
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
