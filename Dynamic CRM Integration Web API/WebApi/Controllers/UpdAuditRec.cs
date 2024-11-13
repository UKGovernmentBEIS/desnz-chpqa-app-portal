using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]
    public class UpdAuditRec : ControllerBase
    {
        private readonly ILogger<UpdAuditRec> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public UpdAuditRec(ILogger<UpdAuditRec> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpPost("UpdAuditRec")]
        [SwaggerOperation(Summary = "Update UpdAuditRec Audit recommendation", Description = "Update  Audit recommendation")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> RequestAuditRec(RequestAuditRec data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                   // if (!await AuthorizationService.ValidateTAssessorRole(User, serviceClient)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.submissionId, serviceClient, _logger, (int)Person.UserType.TechnicalAssessor))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //
                    RequestReturnId returnId = new RequestReturnId();

                    if (data.auditRecId != null)
                    {
                        Entity resultauditrec = new Entity("desnz_auditrecommendation", data.auditRecId ?? Guid.Empty);

                        resultauditrec["desnz_isrecommended"] = data.isRecommended ?? false;
                        resultauditrec["desnz_technicalperformanceconcerns"] = data.technicalPerformanceConcerns ?? false;
                        resultauditrec["desnz_complianceconcerns"] = data.complianceConcerns ?? false;
                        resultauditrec["desnz_comments"] = data.comments;
                        resultauditrec["desnz_submission"] = new EntityReference("desnz_submission", data.submissionId);
                        //update DB submission entry
                        await serviceClient.UpdateAsync(resultauditrec);
                        returnId.id = resultauditrec.Id;
                    }
                    else
                    {
                        Entity resultauditrec = new Entity("desnz_auditrecommendation");

                        resultauditrec["desnz_isrecommended"] = data.isRecommended ?? false;
                        resultauditrec["desnz_technicalperformanceconcerns"] = data.technicalPerformanceConcerns ?? false;
                        resultauditrec["desnz_complianceconcerns"] = data.complianceConcerns ?? false;
                        resultauditrec["desnz_comments"] = data.comments;
                        resultauditrec["desnz_submission"] = new EntityReference("desnz_submission", data.submissionId);
                        //create DB submission entry
                        returnId.id = await serviceClient.CreateAsync(resultauditrec);
                    }

                    await UpdSectionAssessorStatusesFun.UpdSectionAssessorStatuses(data.submissionId, (int)SubmissionGroups.GroupType.AuditRecommendation, (int)SubmissionGroups.GroupCategory.CompleteAssessment, serviceClient, _logger);

                    _logger.LogInformation("Update  Audit recommendation at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), data.submissionId.ToString());

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
