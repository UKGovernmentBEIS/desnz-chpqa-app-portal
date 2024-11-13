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
    public class UpdSubmTotalPowCapMaxHeatCond : ControllerBase
    {
        private readonly ILogger<UpdSubmTotalPowCapMaxHeatCond> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdSubmTotalPowCapMaxHeatCond(ILogger<UpdSubmTotalPowCapMaxHeatCond> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update Submission total power capacity under MaxHeat condition with the given data.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdSubmTotalPowCapMaxHeatCond")]
        [SwaggerOperation(Summary = "Update Submission total power capacity under MaxHeat condition.", Description = "Update Submission total power capacity under MaxHeat condition with the given data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmTotalPowCapMaxHeatCond(UpdateTotalPowCapMaxHeatCond data)
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

                    resultSubmission["desnz_totalpowcapundermaxheatconds"] = data.totalPowCapUnderMaxHeatConds ?? 0.0;

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.TotalPowerCapUnderMaxHeatConditions, (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);


                    _logger.LogInformation("Updated Submission with choosen total power capacity under MaxHeat condition at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

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

        public class UpdateTotalPowCapMaxHeatCond
        {
            [Required] public Guid? idSubmission { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            [Required] public double? totalPowCapUnderMaxHeatConds { get; set; }

        }
    }
}
