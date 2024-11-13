using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]

    public class GetSubmDueDate : ControllerBase
    {
        private readonly ILogger<GetSubmDueDate> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetSubmDueDate(ILogger<GetSubmDueDate> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves The Last Submission Date of the year
        /// </summary>
        /// <remarks>
        /// Sample response:
        ///     {
        ///        "submDueDate": "2024-10-29T14:52:38.119Z",
        ///        "triggerNotificationsTimeOffset": 0,
        ///        "hasSendNotificationsFromLastUpdate": true
        ///        }
        /// </remarks>
        /// <param></param>
        /// <returns></returns>
        /// <response code="200">Returns the Submission Due Date record (Due Date,Trigger Notifications Offset (in hours) from the due date start, The flag if send bulk emails has run) </response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetSubmDueDate")]
        [SwaggerOperation(Summary = "Get Submission Due Date.", Description = "Get last date of the year for submission")]
        [ProducesResponseType(typeof(ReplySubmDueDateConf), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<ReplySubmDueDateConf>> GetSubmDueDateData()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_configurations", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_lastsubmissiondate", "desnz_lastsubmissiondatetimeslotbegin", "desnz_lastsubmissiondateemailalreadysend")
                    };

                    ReplySubmDueDateConf SubmDueDate = new ReplySubmDueDateConf();
                    EntityCollection SubmDueDate_E = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    if (SubmDueDate_E.Entities.Count > 0)
                    {
                        SubmDueDate.submDueDate = SubmDueDate_E.Entities[0].GetAttributeValue<DateTime>("desnz_lastsubmissiondate");
                        SubmDueDate.triggerNotificationsTimeOffset = SubmDueDate_E.Entities[0].GetAttributeValue<int>("desnz_lastsubmissiondatetimeslotbegin");
                        SubmDueDate.hasSendNotificationsFromLastUpdate = SubmDueDate_E.Entities[0].GetAttributeValue<bool>("desnz_lastsubmissiondateemailalreadysend");
                    }

                    return Ok(SubmDueDate);
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
