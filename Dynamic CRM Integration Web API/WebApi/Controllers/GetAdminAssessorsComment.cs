using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using WebApi.Contracts;
using WebApi.Services;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/secure")]
    public class GetAssessorsAdminComment : ControllerBase
    {
        private readonly ILogger<GetAssessorsAssessment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetAssessorsAdminComment(ILogger<GetAssessorsAssessment> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Get last Assessor Admin comment for specific Sumbission.
        /// 
        ///
        ///
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns>Last Assessment for group</returns>
        /// <response code="200">Returns the last comment for Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplyMessage), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetAssessorAdminComment")]
        public async Task<ActionResult> GetComment(Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    //Fetch Comments Table
                    QueryExpression commentsQuery = new QueryExpression
                    {
                        EntityName = "desnz_rpassessorcomment",
                        ColumnSet = new ColumnSet("desnz_comment", "desnz_rpassessorcommentid"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission),
                                new ConditionExpression("desnz_senderusertype", ConditionOperator.Equal, (int)Person.UserType.AssessorAdmin)
                            }
                        },
                        TopCount = 1 // Limit the result to only one record
                    };
                    //Get latest AssessorAdmin comment for this submission first
                    commentsQuery.AddOrder("createdon", OrderType.Descending);

                    EntityCollection commentsResults = await serviceClient.RetrieveMultipleAsync(commentsQuery);
                    
                    var commentToReturn = commentsResults.Entities.FirstOrDefault()?.GetAttributeValue<string>("desnz_comment");

                    return Ok(commentToReturn);
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
    }
}
