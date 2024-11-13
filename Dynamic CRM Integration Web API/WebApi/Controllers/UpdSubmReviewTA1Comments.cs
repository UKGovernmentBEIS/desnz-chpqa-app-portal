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
    public class UpdSubmReviewTA1Comments : ControllerBase
    {
        private readonly ILogger<UpdSubmReviewTA1Comments> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmReviewTA1Comments(ILogger<UpdSubmReviewTA1Comments> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Review technical assessor 1 comments status for the given submission id.
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        [HttpPost("UpdSubmReviewTA1Comments")]
        [SwaggerOperation(Summary = "Update Submission Review technical assessor 1 comments status", Description = "Update a Submission Review technical assessor 1 comments status for the given submission id.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> UpdSubmReviewTA1CommentsFun(RequestUpdSubmReviewTA1Comments data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    // User may be RP or TA2
                    int userRole = await GetUserRoleFun.GetRoleOfUser(User, serviceClient);
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger, userRole))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    // update submission group status and check to unlock next goups
                    if (userRole == (int)Person.UserType.ResponsiblePerson)
                    {
                        await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.ReviewAssessorCommentsRP, (int)SubmissionGroups.GroupCategory.AssessorComments, serviceClient, _logger);
                    }
                    else if (userRole == (int)Person.UserType.TechnicalAssessor2)
                    {
                        await UpdSectionAssessorStatusesFun.UpdSectionAssessor2Statuses(data.idSubmission, (int)SubmissionGroups.GroupType.ReviewAssessorCommentsTA2, (int)SubmissionGroups.GroupCategory.AssessorComments, serviceClient, _logger);
                    }


                    RequestReturnId returnId = new RequestReturnId();
                    returnId.id = data.idSubmission;

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

        public class RequestUpdSubmReviewTA1Comments
        {
            [Required]
            public Guid? idSubmission { get; set; }

        }
    }
}




