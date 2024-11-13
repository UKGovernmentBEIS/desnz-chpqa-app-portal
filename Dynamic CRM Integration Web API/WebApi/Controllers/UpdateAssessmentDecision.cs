using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;


namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]
    public class UpdateAssessmentDecision : ControllerBase
    {
        private readonly ILogger<UpdateAssessmentDecision> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly IConfiguration _configuration;

        public UpdateAssessmentDecision(ILogger<UpdateAssessmentDecision> logger, IServiceClientFactory serviceClientFactory, IConfiguration configuration)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
            _configuration = configuration;
        }

        [HttpPost("UpdateAssessmentDecision")]
        [SwaggerOperation(Summary = "Update Assessment Decision", Description = "Update Assessment Decision")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> AssessmentDecision(RequestAssessmentDecision data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();               
                   // if (!await AuthorizationService.ValidateTAssessorRole(User, serviceClient)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //
                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.submissionId, serviceClient, _logger, (int)Person.UserType.TechnicalAssessor2))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    if (data.certifyChoice == false)
                    {
                        if(data.comments == null || data.comments.Length == 0)
                        {
                            reply.message = "Seconds Assessor's Decision comments cannot be empty if the choice is false - return to First Assessor";
                            return BadRequest(reply);
                        }
                    }
                    else
                    {
                        data.comments = null;
                    }

                    //Call of function for TA2 (Current User)
                    //Types (Person, string, string)
                    var (user, userFullName, errorMessage) = await HelperFunctions.GetCurrentUserFullNameAsync(serviceClient, User);

                    RequestReturnId returnId = new RequestReturnId();

                    if (data.assessmentDecisionId != null)
                    {
                        Entity resultauditrec = new Entity("desnz_assessmentdecision", data.assessmentDecisionId ?? Guid.Empty);

                        resultauditrec["desnz_name"] = "Decision of Submission";
                        resultauditrec["desnz_dateofcertification"] = data.dateOfCertification;
                        resultauditrec["desnz_choice"] = data.certifyChoice;
                        resultauditrec["desnz_comments"] = data.comments;
                        if(user.id != null)
                        {
                            resultauditrec["desnz_technicalassessor2"] = new EntityReference("contact", user.id ?? Guid.Empty);
                        }
                        resultauditrec["desnz_submission"] = new EntityReference("desnz_submission", data.submissionId);
                        //update DB submission entry
                        await serviceClient.UpdateAsync(resultauditrec);
                        returnId.id = resultauditrec.Id;
                    }
                    else
                    {
                        Entity resultauditrec = new Entity("desnz_assessmentdecision");

                        resultauditrec["desnz_name"] = "Decision of Submission";
                        resultauditrec["desnz_dateofcertification"] = data.dateOfCertification;
                        resultauditrec["desnz_choice"] = data.certifyChoice;
                        resultauditrec["desnz_comments"] = data.comments;
                        if (user.id != null)
                        {
                            resultauditrec["desnz_technicalassessor2"] = new EntityReference("contact", user.id ?? Guid.Empty);
                        }
                        resultauditrec["desnz_submission"] = new EntityReference("desnz_submission", data.submissionId);
                        //create DB submission entry
                        returnId.id = await serviceClient.CreateAsync(resultauditrec);
                    }

                    await UpdSectionAssessorStatusesFun.UpdSectionAssessor2Statuses(data.submissionId, (int)SubmissionGroups.GroupType.AssessmentDecision, (int)SubmissionGroups.GroupCategory.CompleteAssessment, serviceClient, _logger);
                    
                    
                    //Email
                    EmailInfo emailInfo = new EmailInfo();
                    
                    //Call of Scheme function
                    var (contact, schemeName, schemeReference) = await HelperFunctions.GetSchemeAndContactInfoAsync(serviceClient, data.submissionId, data.certifyChoice);

                    string comments = ""; //Final comments for dynamic template
                    if (data.certifyChoice != null)
                    {
                        //Create Proper Email (Subject + Body)
                        emailInfo = SendEmailTA2.CreateProperEmail(data.certifyChoice);
                        if (data.certifyChoice == false) //TA1 scenario
                        {
                            comments = "Their comments are:" + data.comments;
                        } 
                    }
                    


                    //Send Email Function Call
                    //string templateFilePath = "./Templates/UpdAssessmentDecTemplate.html";

                    string contactFullName = contact.firstName + " " + contact.lastName;

                    SendEmailTA2 task = new SendEmailTA2(_configuration);
                    string Output = await task.SendEmailToTA1orRP(data.certifyChoice, contactFullName, schemeName, schemeReference, userFullName, contact.email, emailInfo.body, emailInfo.subject, comments);

                    if (Output is not null)
                    {
                       // reply.message = Output.StatusCode.ToString() + "\n" + Output.Headers + "\n" + Output.Body;

                        _logger.LogInformation("Update Assessment Decision at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), data.submissionId.ToString());
                        return Ok(data.submissionId);
                    }
                    else
                    {
                        //reply.message = Output.StatusCode.ToString() + "\n" + Output.Headers + "\n" + Output.Body;
                        reply.message = "Internal Server Error";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }

                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);

                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

       

    }
}
