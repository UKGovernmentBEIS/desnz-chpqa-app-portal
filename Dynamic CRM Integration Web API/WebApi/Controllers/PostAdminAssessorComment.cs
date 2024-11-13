using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;


namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]
    public class PostAdminAssessorComment : ControllerBase
    {
        private readonly ILogger<PostAdminAssessorComment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly IConfiguration _configuration;


        public PostAdminAssessorComment(ILogger<PostAdminAssessorComment> logger, IServiceClientFactory serviceClientFactory, IConfiguration configuration)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _configuration = configuration;
        }

        /// <summary>
        /// Assessor Admin comment for specific Sumbission.
        /// 
        ///
        ///
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns>The ID of the submission</returns>
        /// <response code="200">Returns the ID of the Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("PostAdminAssessorComment")]
        public async Task<ActionResult<RequestReturnId>> PostAdminAssessorCommentToRP(RequestAssessorAdminToRPModel data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.idSubmission, serviceClient, _logger, (int)Person.UserType.AssessorAdmin))
                    {
                        // Submission cannot be edited
                        reply.message = "Internal Server Error Occurred";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
                    //

                    //RP Info Procedures
                    var (RP, schemeName, schemeReference) = await HelperFunctions.GetSchemeAndContactInfoAsync(serviceClient, data.idSubmission, true);

                    //Assessor Admin Procedures
                    Person adminAssessor = new Person();
                    adminAssessor = await HelperFunctions.GetUserPersonInfoAsync(serviceClient, User);

                    string userFullName = adminAssessor.firstName + " " + adminAssessor.lastName; 

                    //Create Comment
                    Entity comment = new("desnz_rpassessorcomment");
                    comment["desnz_comment"] = data.comments;
                    if (adminAssessor.id != null)
                    {
                        comment["desnz_sender"] = new EntityReference("contact", (Guid) adminAssessor.id); //Assessor Entity Lookup
                    }
                    if (RP.id != null)
                    {
                        comment["desnz_receiver"] = new EntityReference("contact", (Guid) RP.id); //RP Entity Lookup
                    }
                    comment["desnz_senderusertype"] = new OptionSetValue((int)adminAssessor.userType);
                    if (data.idSubmission != null)
                    {
                        comment["desnz_submission"] = new EntityReference("desnz_submission", (Guid) data.idSubmission);
                    }
                    comment.Id = await serviceClient.CreateAsync(comment); // Comment Creation

                    string RPfullname = RP.firstName + " " + RP.lastName;

                    //Change Scheme Status
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(data.idSubmission, (int)Submission.SubmissionStatus.ReturnToRPFromAA, serviceClient, _logger);

                    //Complete "Return Scheme to RP" group
                    await UpdSectionStatusesFun.CompleteGroup(data.idSubmission, (int)SubmissionGroups.GroupType.ReturnSchemeToRpFromAA, serviceClient);

                    //Function for Reseting the statuses of RP groups
                    await UpdSectionStatusesFun.ResetRPGroups(data.idSubmission, serviceClient);

                    AssessorAdminSendEmailToRP task = new AssessorAdminSendEmailToRP(_configuration);
                    await task.SendEmailToRP(RPfullname, schemeName, schemeReference, userFullName, RP.email, data.comments);
                    
                    _logger.LogInformation("Assign Second Assessor or RP at {DT} with Submission id : {id}", DateTime.UtcNow.ToLongTimeString(), data.idSubmission.ToString());
                    return Ok(data.idSubmission);
                    
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

        public class RequestAssessorAdminToRPModel
        {
            [Required]
            public Guid? idSubmission { get; set; }
            [Required]
            public string? comments { get; set; }
        }

        
    }
}
