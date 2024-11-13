using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdSubmtoAssessor : ControllerBase
    {
        private readonly ILogger<UpdSubmtoAssessor> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly string _UpdateSubmit2AssesorTemplate;
        private readonly IConfiguration _configuration;
       
        public UpdSubmtoAssessor(IConfiguration configuration, ILogger<UpdSubmtoAssessor> logger, IServiceClientFactory serviceClientFactory)
        {
           
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _UpdateSubmit2AssesorTemplate = configuration["GovUKUpdateSubmit2AssesorTemplate"];
            _configuration = configuration;
        }

        [HttpPost("UpdSubmtoAssessor")]
        public async Task<ActionResult<RequestReturnId>> SubmittoAssessor(UpdSubmtoAssessorClass data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger))
                    {
                        reply.message = "Internal Server Error Occurred";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
                    //

                    Entity resultSubmission = new Entity("desnz_submission", data.idSubmission ?? Guid.Empty);       // get submission

                    // update submission group status and check to unlock next goups
                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.idSubmission, (int)SubmissionGroups.GroupType.SubmitToAssessor, (int)SubmissionGroups.GroupCategory.SubmitToAssessor, serviceClient, _logger);

                    // update the energy power heat statuses based on RP's statuses
                    await UpdSectionAssessorStatusesFun.UpdEnergyPowerHeatSectionAssessorStatuses(data.idSubmission, serviceClient, _logger);

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.Unassinged, serviceClient, _logger);


                    _logger.LogInformation("submit to Assessor at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                    RequestReturnId returnId = new RequestReturnId();
                    returnId.id = resultSubmission.Id;

                    Person userPerson = await HelperFunctions.GetUserPersonInfoAsync(serviceClient, User);
                    
                    string FullName = userPerson.firstName + " " + userPerson.lastName;
                    string Email = userPerson.email;

                    SendEmail emailProxy = new SendEmail(_configuration);

                    // TODO REFACTOR send email
                    return Ok(returnId.id);

                    string Outpout = await emailProxy.SendEmailWithTemplate(_UpdateSubmit2AssesorTemplate, FullName, data.Schemename, Email);

                    if (Outpout == "Email sent successfully.") {
                        return Ok(returnId.id); 
                    }
                    else
                    {
                        reply.message = Outpout;
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
                    
                }
            }
            catch (Exception ex)
            {
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                _logger.LogError(ex.Message);
                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

        public class UpdSubmtoAssessorClass
        {
            [Required] public Guid? idSubmission { get; set; }
            public Guid? Userid { get; set; }
            [Required] public string Schemename { get; set; }
        }
    }
}
