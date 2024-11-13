using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdSubmROCSCertif : ControllerBase
    {
        private readonly ILogger<UpdSubmROCSCertif> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmROCSCertif(ILogger<UpdSubmROCSCertif> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        [HttpPost("UpdSubmROCSCertif")]
        [SwaggerOperation(Summary = "Update Submission required a Renewable Obligation certificate.", Description = "Update Submission required a Renewable Obligation certificate with the given data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmROCSCertif(RequestUpdSubmROCSCertif data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }
             
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", data.idSubmission ?? Guid.Empty);       // get submission

                    RequestReturnId returnId = new RequestReturnId();

                    resultSubmission["desnz_needanrenewablesobligationcertificate"] = data.rocsCertificate ?? null;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.RenewablesObligationCertificate, (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);


                    _logger.LogInformation("Updated Submission with a choice (yes/no) in required a Renewable Obligation certificate question at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

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
    }
}
