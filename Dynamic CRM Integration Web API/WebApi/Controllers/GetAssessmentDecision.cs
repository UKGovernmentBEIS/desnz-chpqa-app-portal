using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]

    public class GetAssessmentDecision : ControllerBase
    {
        private readonly ILogger<GetAssessmentDecision> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetAssessmentDecision(ILogger<GetAssessmentDecision> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpGet("GetAssessmentDecision")]
        [SwaggerOperation(Summary = "Get Assessment Decision for submission", Description = "Get Assessment Decision for submission")]
        [ProducesResponseType(typeof(ReplyAssessmentDecision), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<ReplyAssessmentDecision>> GetAssessmentDecisionBySubmissionId([FromQuery, Required] Guid SubmissionId)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_assessmentdecision", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_assessmentdecisionid", "desnz_choice", "desnz_dateofcertification", "desnz_comments"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, SubmissionId )
                            }
                        }
                    };

                    ReplyAssessmentDecision AssessmentDec = new ReplyAssessmentDecision();
                    EntityCollection relatedAuditRecresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    if (relatedAuditRecresults.Entities.Count > 0)
                    {
                        AssessmentDec.assessmentDecisionId = relatedAuditRecresults.Entities[0].GetAttributeValue<Guid>("desnz_assessmentdecisionid");
                        AssessmentDec.certifyChoice = relatedAuditRecresults.Entities[0].GetAttributeValue<bool>("desnz_choice");
                        AssessmentDec.dateOfCertification = relatedAuditRecresults.Entities[0].GetAttributeValue<DateTime>("desnz_dateofcertification");
                        AssessmentDec.comments = relatedAuditRecresults.Entities[0].GetAttributeValue<string>("desnz_comments");
                    }

                    return Ok(AssessmentDec);
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
