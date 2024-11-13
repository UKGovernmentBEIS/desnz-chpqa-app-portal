using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;
using static WebApi.Controllers.GetAssessCommentsTA1;

namespace WebApi.Controllers
{
    [Route("/api/assessors")]
    [ApiController]
    public class AssignSecondAssessorOrRp : ControllerBase
    {
        private readonly ILogger<AssignSecondAssessorOrRp> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly IConfiguration _configuration;

        public AssignSecondAssessorOrRp(IConfiguration configuration, ILogger<AssignSecondAssessorOrRp> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _configuration = configuration;
        }

        [HttpPost("AssignSecondAssessorOrRp")]
        public async Task<ActionResult<RequestReturnId>> AssignSecAssessorOrRp(AssignSecondAsOrRp data)
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
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.SubmissionId, serviceClient, _logger, (int)Person.UserType.TechnicalAssessor))
                    {
                        reply.message = "Internal Server Error Occured";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
                    //

                    //Current User Info
                    var (user, userFullName, errorMessage) = await HelperFunctions.GetCurrentUserFullNameAsync(serviceClient, User);

                    ReplyAssessCommentsTA1 replyAssessCommentsTA1 = await CheckSubmAssessStatusFun.CheckSubmAssessStatusFromList(data.SubmissionId, serviceClient, _logger);

                    // update the submit assessment status to complete
                    await UpdSectionAssessorStatusesFun.UpdSectionAssessorStatuses(data.SubmissionId, (int)SubmissionGroups.GroupType.SubmitAssessment, (int)SubmissionGroups.GroupCategory.CompleteAssessment, serviceClient, _logger);

                    // TODO
                    // check if it is completed the procced

                    // set latest submission status and TA2 if we have
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusAndTA2InScheme(data.SubmissionId, data.SecondAssessorId ?? Guid.Empty, replyAssessCommentsTA1.submissionStatus, serviceClient, _logger);

                    // REMOVE BELOW LATER ////////////////////////////////////////////////////////////////////////////
                    // TMP ASSIGN TA1 = USER TO SCHEME
                    Entity resultSubmission = await serviceClient.RetrieveAsync("desnz_submission", data.SubmissionId, new ColumnSet("desnz_submissionid", "desnz_name", "desnz_scheme"));

                    EntityReference schemeResult = null;

                    if (resultSubmission.Contains("desnz_scheme") && (resultSubmission["desnz_scheme"] != null))
                    {
                        //Submission of group
                        schemeResult = resultSubmission["desnz_scheme"] as EntityReference;
                    }

                    Guid schemeIdFromSubmission = schemeResult == null ? Guid.Empty : schemeResult.Id;

                    // get scheme
                    Entity schemeEntity = new Entity("desnz_scheme", schemeIdFromSubmission);
                    schemeEntity["desnz_assessor"] = new EntityReference("contact", user.id ?? Guid.Empty);

                    await serviceClient.UpdateAsync(schemeEntity);

                    // REMOVE ABOVE LATER ////////////////////////////////////////////////////////////////////////////

                    int submissionStatus = replyAssessCommentsTA1.submissionStatus;
                    string ContactFullName = "";
                    string ContactEmailAddress = "";
                    string SchemeName = "";
                    string SchemeReference = "";
                    //Scenario 1 -> Email Goes to TA2
                    if ((submissionStatus == (int)Submission.SubmissionStatus.Approved) || (submissionStatus == (int)Submission.SubmissionStatus.Rejected))
                    {
                        var (contactFullName, emailAddress, schemeName, schemeReference) = await HelperFunctions.GetSchemeAndTA2InfoAsync(serviceClient, data.SubmissionId);
                        ContactFullName = contactFullName;
                        ContactEmailAddress = emailAddress;
                        SchemeName = schemeName;
                        SchemeReference = schemeReference;

                    }
                    else if (submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges) //Scenario 2 -> Email goes back to RP
                    {
                        //Fetch RP from scheme via submissionId
                        var (contactFullName, emailAddress, schemeName, schemeReference) = await HelperFunctions.GetSchemeAndRPInfoAsync(serviceClient, data.SubmissionId);
                        ContactFullName = contactFullName;
                        ContactEmailAddress = emailAddress;
                        SchemeName = schemeName;
                        SchemeReference = schemeReference;
                        //RP and Scheme Info

                        //Function for Reseting the statuses of RP groups
                        await UpdSectionStatusesFun.ResetRPGroups(data.SubmissionId, serviceClient);

                    }
                    //Submission fetch and scenario routes END


                    //Create Proper Email Info -- Via submissionStatus
                    EmailInfo emailInfo = new EmailInfo();
                    emailInfo.body = SendEmailToRPorTA2.CreateProperEmailBody(submissionStatus);
                    emailInfo.subject = SendEmailToRPorTA2.CreateProperEmailSubject(submissionStatus);
                    //Create Email Info END

                    //send email
                    //string templatefilepath = "./Templates/assessor-email.html";
                    SendEmailToRPorTA2 task = new SendEmailToRPorTA2(_configuration);
                    string Outpout = await task.SendEmailWithTemplate(submissionStatus,
                        ContactFullName, SchemeName, SchemeReference, userFullName, ContactEmailAddress, replyAssessCommentsTA1.groupList, emailInfo.body, emailInfo.subject);

                    if (Outpout == "Email sent successfully.")
                    {
                        _logger.LogInformation("Assign Second Assessor at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), data.SecondAssessorId.ToString());
                        return Ok(data.SubmissionId);
                    }
                    else
                    {
                        reply.message = "Internal Server Error Occured";
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

        public class AssignSecondAsOrRp
        {
            [Required] public Guid SubmissionId { get; set; }
            public Guid? SecondAssessorId { get; set; }
        }

        public class EmailInfo
        {
            public string subject;
            public string body;
        }
    }
}
