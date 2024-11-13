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
    public class UpdSubmDueDateConf : ControllerBase
    {
        private readonly ILogger<UpdSubmDueDateConf> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public UpdSubmDueDateConf(ILogger<UpdSubmDueDateConf> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Updates The Last Submission Date of the year
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     {
        ///        "submDueDate": "2024-10-29T14:52:38.119Z",
        ///        "triggerNotificationsTimeOffset": 0,
        ///        "hasSendNotificationsFromLastUpdate": true
        ///        }
        /// </remarks>
        /// <param></param>
        /// <returns></returns>
        /// <response code="200">Returns the Record Id </response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdSubmDueDateConf")]
        [SwaggerOperation(Summary = "Update UpdSubmDueDateConfig SubmissionDueDate Configuration", Description = "Update Submission Due Date Configuration")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> RequestDueDate(RequestSubmDueDateConf data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    ReplyMessage reply = new ReplyMessage();

                    if (data == null)
                    {
                        reply.message = "data is null";
                        return BadRequest(reply);
                    }

                    // First we have to check if the SubmissionEndDate has already been set. If not then insert it. Else update the entry.
                    // Normaly this entity holds just one record, so we don't need a MultiAsync to retreive a collection of entities.
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_configurations", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_lastsubmissiondate")

                    };

                    RequestSubmDueDateConf ConfDueDate = new RequestSubmDueDateConf();  // We just need a value object with one DateTime field to hold the DueDate!
                    EntityCollection q_results = await serviceClient.RetrieveMultipleAsync(relatedquery);
                    Entity change_E = new Entity("desnz_configurations");

                    RequestReturnId returnId = new RequestReturnId();

                    change_E["desnz_lastsubmissiondate"] = data.submDueDate;

                    if (q_results.Entities.Count == 0)
                    {
                        change_E["desnz_lastsubmissiondatetimeslotbegin"] = 8; //initial record set it to start sending email notifications at 08:00 of due date
                        change_E["desnz_lastsubmissiondateemailalreadysend"] = false; // initially set that it hasn't yet send email notifications
                        change_E.Id = await serviceClient.CreateAsync(change_E);
                    }
                    else
                    {
                        change_E.Id = q_results.Entities[0].Id;
                        change_E["desnz_lastsubmissiondatetimeslotbegin"] = data.triggerNotificationsTimeOffset ?? 8;
                        change_E["desnz_lastsubmissiondateemailalreadysend"] = data.hasSendNotificationsFromLastUpdate ?? false;

                        await serviceClient.UpdateAsync(change_E);
                    }

                    _logger.LogInformation("Update Submission Due Date at {DT}.", DateTime.UtcNow.ToLongTimeString());
                    returnId.id = change_E.Id;
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
    }
}
