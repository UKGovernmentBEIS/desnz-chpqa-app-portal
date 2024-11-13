using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdStatusofAssessor : ControllerBase
    {
        private readonly ILogger<UpdStatusofAssessor> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;      
        public UpdStatusofAssessor(IConfiguration configuration, ILogger<UpdStatusofAssessor> logger, IServiceClientFactory serviceClientFactory)
        {           
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }


        [HttpPost("UpdateStatusofAssessor")]
        public async Task<ActionResult<RequestReturnId>> UpdateStatusofAssessor(UpdStatusofAssessorClass data)
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
                    Entity resultGroup = new Entity("desnz_group", data.idGroup ?? Guid.Empty);                      // get status group

                    RequestReturnId returnId = new RequestReturnId();
            
                    resultGroup["desnz_status"] = new OptionSetValue(data.status ?? 0);

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);
                    await serviceClient.UpdateAsync(resultGroup);

                    _logger.LogInformation("update status of Assessor at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

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

        public class UpdStatusofAssessorClass
        {
            [Required] public Guid? idSubmission { get; set; }
            [Required] public Guid? idGroup { get; set; }
            [Required] public int? status { get; set; }        
        }
    }
}
