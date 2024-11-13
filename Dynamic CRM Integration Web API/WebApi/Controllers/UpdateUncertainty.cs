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
    public class UpdateUncertainty : ControllerBase
    {
        private readonly ILogger<UpdateUncertainty> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdateUncertainty(ILogger<UpdateUncertainty> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpPost("UpdateUncertainty")]
        [SwaggerOperation(Summary = "Update UpdateUncertainty", Description = "Update UpdateUncertainty")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> UpdateUncertaintyFactors(Uncertainty data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();
          
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", data.idSubmission ?? Guid.Empty);       // get submission

                    RequestReturnId returnId = new RequestReturnId();

                    resultSubmission["desnz_foi"] = data.FOI ?? 0.0m;
                    resultSubmission["desnz_fop"] = data.FOP ?? 0.0m;
                    resultSubmission["desnz_foh"] = data.FOH ?? 0.0m;
                    resultSubmission["desnz_uncertaintyfactorcomment"] = data.uncertaintyFactorComment;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);
                    //await serviceClient.UpdateAsync(resultGroup);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.ProvideUncertaintyFactors, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                    _logger.LogInformation("Updated Update UpdateUncertainty at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

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

        public class Uncertainty
        {
            [Required]
            public Guid? idSubmission { get; set; }

            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? FOI { get; set; }
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? FOP { get; set; }
            [Required]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public decimal? FOH { get; set; }
            public string? uncertaintyFactorComment {get; set;}
        }
    }
}
