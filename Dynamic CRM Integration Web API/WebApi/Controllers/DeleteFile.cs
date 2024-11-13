using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class DeleteFile : ControllerBase
    {
        private readonly ILogger<DeleteFile> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public DeleteFile(ILogger<DeleteFile> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpDelete("DeleteFile")]
        public async Task<ActionResult<RequestReturnId>> DeleteFileFromEntity(RequestDeleteFile data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    if (data.parentEntity != null)
                    {
                        if (data.parentEntity == "desnz_submission")
                        {
                            await serviceClient.DeleteAsync("desnz_submissiondiagramsfiles", data.fileID);
                        }
                        else if (data.parentEntity == "desnz_primemovers")
                        {
                            await serviceClient.DeleteAsync("desnz_equipmentfiles", data.fileID);
                        }
                        else if (data.parentEntity == "desnz_fuelmeters")
                        {
                            await serviceClient.DeleteAsync("desnz_meterfiles", data.fileID);
                        }else
                        {
                            reply.message = "Wrong value of parent entity";
                            return StatusCode(StatusCodes.Status500InternalServerError, reply);
                        }
                        return Ok(data.fileID);
                    }
                    reply.message = "Parent Entity cannot be null";
                    return StatusCode(StatusCodes.Status500InternalServerError, reply);
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
        public class RequestDeleteFile
        {
            [Required] public string parentEntity { get; set; }

            [Required] public Guid fileID { get; set; }

            [Required] public Guid idSubmission { get; set; }

        }
    }
}
