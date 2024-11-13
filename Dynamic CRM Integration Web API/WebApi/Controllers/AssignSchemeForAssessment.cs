using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{

    [Route("/api/assessors")]
    [ApiController]
    public class AssignSchemeForAssessment : ControllerBase
    {
        private readonly ILogger<AssignSchemeForAssessment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly IConfiguration _configuration;

        public AssignSchemeForAssessment(IConfiguration configuration, ILogger<AssignSchemeForAssessment> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _configuration = configuration;
        }

        /// <summary>
        /// TMP api call that changes the status of the scheme/submission to submitted for First level assessment to be enabled
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the Submission id</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplySubmission), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [SwaggerOperation(Summary = "Assign Scheme For Assessment", Description = "Assign Scheme For Assessment")]
        [HttpPost("AssignSchemeForAssessment")]
        public async Task<IActionResult> AssignSchemeForAssessmentFun(RequestAssignSchemeForAssessment data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.submissionId, serviceClient, _logger, (int)Person.UserType.AssessorAdmin))
                    {
                        // Submission cannot be edited
                        reply.message = "Internal Server Error Occurred";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
                    //

                    //Current User Info
                    Person userPerson = await HelperFunctions.GetUserPersonInfoAsync(serviceClient, User);


                    // TODO the proper logic
                    
                    

                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.submissionId, (int)Submission.SubmissionStatus.Submitted, serviceClient, _logger);


                    _logger.LogInformation("Assign Submission For Assessment at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), data.submissionId.ToString());


                    RequestReturnId returnId = new RequestReturnId();
                    returnId.id = data.submissionId;

                    return Ok(returnId.id);
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

        public class RequestAssignSchemeForAssessment
        {
            [Required] public Guid submissionId { get; set; }
            // this can be an TA1 or TA2 id
            public Guid? firstAssessorId { get; set; }
        }

    }
}

