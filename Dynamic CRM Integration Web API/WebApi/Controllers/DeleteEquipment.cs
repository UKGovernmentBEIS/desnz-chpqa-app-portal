using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class DeleteEquipment : ControllerBase
    {
        private readonly ILogger<DeleteEquipment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public DeleteEquipment(ILogger<DeleteEquipment> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpDelete("DeleteEquipment")]
        public async Task<ActionResult<RequestDeleteEquipment>> DeleteEquipment_(RequestDeleteEquipment data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                 
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.submissionId, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    await serviceClient.DeleteAsync("desnz_primemovers", data.EquipmentId);

                    await UpdEquipmentCalc.CalculateAsync(data.submissionId, serviceClient);
                            
                    await UpdEnergyInputsXYCalc.CalculateAsync(data.submissionId, serviceClient);

                    await UpdEnergyInputsCalc.CalculateAsync(data.submissionId, serviceClient);
               
                    await UpdSubmCalcEfficAndQIFun.CalculateAsync(data.submissionId, serviceClient);

                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.submissionId, (int)SubmissionGroups.GroupType.AddPrimeMoverDetails, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger, UpdSectionStatusesFun.ModeFlag.Normal);

                    return Ok(data.EquipmentId);
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

        public class RequestDeleteEquipment
        {
            [Required]
            public Guid submissionId { get; set; }

            [Required]
            public Guid EquipmentId { get; set; }

        }
    }
}
