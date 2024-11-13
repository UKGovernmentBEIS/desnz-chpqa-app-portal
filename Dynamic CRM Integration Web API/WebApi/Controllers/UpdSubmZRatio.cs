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
    public class UpdSubmZRatio : ControllerBase
    {
        private readonly ILogger<UpdSubmQIThreshold> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public UpdSubmZRatio(ILogger<UpdSubmQIThreshold> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpPost("UpdSubmZRatio")]
        [SwaggerOperation(Summary= "Update Submission Z Ratio", Description = "Update a Submission Z Ratio with the given Z Ratio data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmZRatio(RequestUpdateSubmissionZRatio data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();
           
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", data.idSubmission ?? Guid.Empty);       // get submission

                    RequestReturnId returnId = new RequestReturnId();

                    resultSubmission["desnz_isthezratioofthisschemedetermined"] = data.zRatioDetermined ?? false;
                    resultSubmission["desnz_whyitisnotpossibletodeterminethezration"] = data.possibleToDetermineZRatio ?? "";
                    resultSubmission["desnz_steamexportpressure"] = data.steamExportPressure ?? 0.0m;
                    resultSubmission["desnz_steamturbinesize"] = data.steamturbinesize ?? 0.0m;
                    resultSubmission["desnz_zratio"] = data.zratio ?? 0.0m;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.ProvideCondensingSteamTurbineDetails, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);


                    _logger.LogInformation("Updated Submission with choosen Quality Index Threshold at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                    returnId.id = resultSubmission.Id;

                    // update submission with calculations of efficiencies and QI
                    await UpdSubmCalcEfficAndQIFun.CalculateAsync(returnId.id, serviceClient);

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
