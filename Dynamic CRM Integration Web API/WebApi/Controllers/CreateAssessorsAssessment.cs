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
    [Route("api/assessors")]
    [ApiController]
    public class CreateAssessorsAssessment : ControllerBase
    {
        private readonly ILogger<CreateAssessorsAssessment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public CreateAssessorsAssessment(ILogger<CreateAssessorsAssessment> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Create an assessment for group with specific ID.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the new Group</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("CreateAssessorsAssessment")]
        [SwaggerOperation(Summary = "Create an Assessment for group", Description = "Create an Assessment for group with specific ID")]
        public async Task<ActionResult> PostAssessment(RequestCreateSubmGroupDetails data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {     
                    //if (!await AuthorizationService.ValidateTAssessorRole(User, serviceClient)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //

                    ReplyMessage reply = new ReplyMessage();

                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.submissionId, serviceClient, _logger, (int)Person.UserType.TechnicalAssessor))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }



                    Entity groupResult = await serviceClient.RetrieveAsync("desnz_group", data.submissionGroupId ?? Guid.Empty, new ColumnSet("desnz_groupid", "desnz_submission", "desnz_assessorstatus", "desnz_grouptype", "desnz_groupcategory", "desnz_assessor"));

                    if (groupResult == null)
                    {
                        reply.message = "Wrong group id";
                        return BadRequest(reply);
                    }

                    Guid assessorId = await AuthorizationService.GetUserId(User, serviceClient);
                    if (assessorId != Guid.Empty)
                    {
                        groupResult["desnz_assessor"] = new EntityReference("contact", assessorId);
                    }

                    EntityReference groupSubmission = null;

                    if (groupResult.Contains("desnz_submission") && (groupResult["desnz_submission"] != null))
                    {
                        //Submission of group
                        groupSubmission = groupResult["desnz_submission"] as EntityReference;
                    }


                    Guid submissionIdFromGroup = groupSubmission == null ? Guid.Empty : groupSubmission.Id;

                    if (submissionIdFromGroup != data.submissionId)
                    {
                        reply.message = "Submission Id of group is not the same as the submission id given.";
                        return Unauthorized(reply);
                    }

                    int? groupType = null;
                    if (groupResult.Attributes.ContainsKey("desnz_grouptype") && groupResult["desnz_grouptype"] is OptionSetValue optionSetValueGroupTyped)
                    {
                        groupType = optionSetValueGroupTyped.Value;
                    }
                    else
                    {
                        reply.message = "Internal Server Error Occurred";
                        _logger.LogError("Submission Group without groupType property {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), data.submissionGroupId.ToString());
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }





                    Entity groupDetail = new("desnz_groupdetail");

                    groupDetail["desnz_group"] = new EntityReference("desnz_group", data.submissionGroupId ?? Guid.Empty);

                    // if group id is of mandatory assessment section then we need assessment outcome else return 400
                    if (!Enum.IsDefined(typeof(SubmissionGroups.GroupTypeWithNoAssessorStatusInApiCall), groupType))
                    {
                        if (data.groupDetails.assessmentOutcome == null)
                        {
                            reply.message = "Required field assessmentOutcome";
                            return BadRequest(reply);
                        }
                        else
                        {
                            groupDetail["desnz_assessmentstatus"] = new OptionSetValue(data.groupDetails.assessmentOutcome ?? (int)SubmissionGroupDetails.AssessmentOutcome.Rejected);
                            // we should only store the change needed comment only when the assessment is needs Change
                            if (data.groupDetails.assessmentOutcome == (int)SubmissionGroupDetails.AssessmentOutcome.NeedsChange)
                            {
                                groupDetail["desnz_changeneededcomment"] = data.groupDetails.changeNeededComment;
                            }
                            else
                            {
                                groupDetail["desnz_changeneededcomment"] = null;
                            }
                        }
                    }
                    else    // if group id is of optional assessment section the just approve it
                    {
                        groupDetail["desnz_assessmentstatus"] = new OptionSetValue((int)SubmissionGroupDetails.AssessmentOutcome.Approved);
                        groupDetail["desnz_changeneededcomment"] = null;
                        data.groupDetails.assessmentOutcome = (int)SubmissionGroupDetails.AssessmentOutcome.Approved;
                    }

                    groupDetail["desnz_sectionassessmentcomment"] = data.groupDetails.sectionAssessmentComment;
                    if (assessorId != Guid.Empty)
                    {
                        groupDetail["desnz_contact"] = new EntityReference("contact", assessorId);
                    }


                    groupDetail.Id = await serviceClient.CreateAsync(groupDetail);


                    //Update assessorStatus of Group
                    if (data.groupDetails.assessmentOutcome == 0)
                    {
                        groupResult["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.Approved);
                    }
                    else if (data.groupDetails.assessmentOutcome == 1)
                    {
                        groupResult["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NeedsChange);
                    }
                    else if (data.groupDetails.assessmentOutcome == 2)
                    {
                        groupResult["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.Rejected);
                    }
                    else
                    {
                        groupResult["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NotStarted);
                    }

                    await serviceClient.UpdateAsync(groupResult);


                    int groupTypeNum = groupResult.GetAttributeValue<OptionSetValue>("desnz_grouptype").Value; //gets groupTypeNumber 
                    int groupCategoryNum = groupResult.GetAttributeValue<OptionSetValue>("desnz_groupcategory").Value; //gets groupCategoryNumber
                                                                                                                       // SubmissionID - groupType number - assessmentOutcome - client - logger
                    await UpdSectionAssessorStatusesFun.UpdSectionAssessorStatuses(data.submissionId, groupTypeNum, groupCategoryNum, serviceClient, _logger);


                    _logger.LogInformation("New Group Detail created at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), groupDetail.Id.ToString());

                    return Ok(groupDetail.Id);
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

    public class RequestCreateSubmGroupDetails
    {
        [Required]
        public Guid? submissionId { get; set; }                        // desnz_submissionid
        [Required]
        public Guid? submissionGroupId { get; set; }                   // desnz_group
        public RequestSubmGroupDetails groupDetails { get; set; }       // desnz_groupdetail
    }


}
