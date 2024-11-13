using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Services;
using WebApi.Model;
using WebApi.Functions;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdateSubmissionReviewSchemeDetails : ControllerBase
    {
        private readonly ILogger<UpdateSubmissionReviewSchemeDetails> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdateSubmissionReviewSchemeDetails(ILogger<UpdateSubmissionReviewSchemeDetails> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Review Scheme Details status with the given status.
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        [HttpPost("UpdateSubmissionReviewSchemeDetails")]
        [SwaggerOperation(Summary = "Update Submission Review Scheme Details", Description = "Update a Submission Review Scheme Details status with the given status.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmissionReviewSchemeDetails(UpdateReviewSchemeDetails data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();


                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(data.idSubmission), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", new Guid(data.idSubmission));       // get submission
                    
                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);
                    
                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.ReviewRpAndSiteContact, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(new Guid(data.idSubmission), (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                    _logger.LogInformation("Updated Submission with given status of Review Scheme Details at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                    RequestReturnId returnId = new RequestReturnId();
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

        public class UpdateReviewSchemeDetails
        {
            [Required]
            public string? idSubmission { get; set; }
            
        }
    }
}
