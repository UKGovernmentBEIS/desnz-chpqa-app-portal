using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
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
    public class UpdateSubmissionHoursOfOp : ControllerBase
    {
        private readonly ILogger<UpdateSubmissionHoursOfOp> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdateSubmissionHoursOfOp(ILogger<UpdateSubmissionHoursOfOp> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Hours of Operation with the given Hours and Months of Operation, for simple form send null momnths.
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdateSubmissionHoursOfOp")]
        [SwaggerOperation(Summary = "Update Submission Hours of Operation", Description = "Update a Submission Hours of Operation with the given Hours and Months of Operation, for simple form send 12 momnths always.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmissionHoursOfOp(UpdateHoursOfOp data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();
                 

                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", data.idSubmission ?? Guid.Empty);       // get submission
                    
                    RequestReturnId returnId = new RequestReturnId();

                    resultSubmission["desnz_hoursofoperation"] = data.hoursOfOperation ?? 0.0m;
                    if(data.months != null)
                    {
                        resultSubmission["desnz_months"] = data.months;
                    }
                    
                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);
                    
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.ProvideHoursOfOperation, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);


                    _logger.LogInformation("Updated Submission with choosen Hour of Operations and Months at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                    returnId.id = resultSubmission.Id;
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

        public class UpdateHoursOfOp
        {
            [Required]
            public Guid? idSubmission { get; set; }
           
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? hoursOfOperation { get; set; }

            [Range(0, 12, ErrorMessage = "The value must be a positive number between 0 and 12.")]
            public int? months { get; set; }

        }
    }
}
