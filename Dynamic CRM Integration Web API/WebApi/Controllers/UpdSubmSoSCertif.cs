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
    public class UpdSubmSoSCertif : ControllerBase
    {
        private readonly ILogger<UpdSubmSoSCertif> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmSoSCertif(ILogger<UpdSubmSoSCertif> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update Submission required a Secretary of State exemption certificate with the given data.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdSubmSoSCertif")]
        [SwaggerOperation(Summary = "Update Submission required a Secretary of State exemption certificate.", Description = "Update Submission required a Secretary of State exemption certificate with the given data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmSoSCertif(RequestUpdSubmSoSCertif data)
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

                    resultSubmission["desnz_needasoscertificate"] = data.sosCertificate ?? null;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.SecretaryOfStateExemptionCertificate, (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                    _logger.LogInformation("Updated Submission with a choice (yes/no) in required a Secretary of State exemption certificate question at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

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

        public class RequestUpdSubmSoSCertif
        {
            [Required] public Guid? idSubmission { get; set; }
            [Required] public bool? sosCertificate { get; set; }

        }
    }
}
