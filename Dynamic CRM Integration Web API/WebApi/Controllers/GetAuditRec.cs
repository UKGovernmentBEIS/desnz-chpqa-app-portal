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

    public class GetAuditRec : ControllerBase
    {
        private readonly ILogger<GetAuditRec> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetAuditRec(ILogger<GetAuditRec> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpGet("GetAuditRec")]
        [SwaggerOperation(Summary = "Get Audit recommendations for submission", Description = "Get Audit recommendations for submission")]
        [ProducesResponseType(typeof(ReplyAuditRec), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<ReplyAuditRec>> GetAuditRectBySubmissionId([FromQuery, Required] Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_auditrecommendation", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_auditrecommendationid", "desnz_isrecommended", "desnz_technicalperformanceconcerns", "desnz_complianceconcerns", "desnz_comments"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                            }
                        }
                    };

                    ReplyAuditRec AuditsRec = new ReplyAuditRec();
                    EntityCollection relatedAuditRecresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    if (relatedAuditRecresults.Entities.Count > 0)
                    {
                        AuditsRec.auditRecId = relatedAuditRecresults.Entities[0].GetAttributeValue<Guid>("desnz_auditrecommendationid");
                        AuditsRec.isRecommended = relatedAuditRecresults.Entities[0].GetAttributeValue<bool>("desnz_isrecommended");
                        AuditsRec.technicalPerformanceConcerns = relatedAuditRecresults.Entities[0].GetAttributeValue<bool>("desnz_technicalperformanceconcerns");
                        AuditsRec.complianceConcerns = relatedAuditRecresults.Entities[0].GetAttributeValue<bool>("desnz_complianceconcerns");
                        AuditsRec.comments = relatedAuditRecresults.Entities[0].GetAttributeValue<string>("desnz_comments");
                    }

                    return Ok(AuditsRec);
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
