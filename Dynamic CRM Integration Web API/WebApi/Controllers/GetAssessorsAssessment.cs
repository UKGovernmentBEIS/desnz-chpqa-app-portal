using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/assessors")]
    public class GetAssessorsAssessment : ControllerBase
    {
        private readonly ILogger<GetAssessorsAssessment> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetAssessorsAssessment(ILogger<GetAssessorsAssessment> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Get last assessment for specific group of a Sumbission.
        /// 
        ///
        ///
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns>Last Assessment for group</returns>
        /// <response code="200">Returns the last assessment for group</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplySubmGroupDetails), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetAssessorsAssessment")]
        [SwaggerOperation(Summary = "Get Assessors Assessment", Description = "Get Assessors Assessment")]
        public async Task<ActionResult> GetAssessment(Guid submissionId, Guid submissionGroupId)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
        
                
                  //  if (!await AuthorizationService.ValidateTAssessorRole(User, serviceClient)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //

                    QueryExpression groupQuery = new QueryExpression
                    {
                        EntityName = "desnz_groupdetail",
                        ColumnSet = new ColumnSet("desnz_assessmentstatus", "desnz_sectionassessmentcomment", "desnz_changeneededcomment", "desnz_groupdetailid", "desnz_group"),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_group", // Parent entity
                                LinkFromAttributeName = "desnz_group", // Parent entity attribute
                                LinkToEntityName = "desnz_group", // Related entity
                                LinkToAttributeName = "desnz_groupid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_groupid", "desnz_name", "desnz_assessor", "desnz_submission" ),
                                EntityAlias = "Group", // Alias for the related entity
                      
                            }
                        },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_group", ConditionOperator.Equal, submissionGroupId)
                            }
                        }
                    };
                    groupQuery.AddOrder("createdon", OrderType.Descending);

                    EntityCollection groupDetailResults = await serviceClient.RetrieveMultipleAsync(groupQuery);

                    ReplySubmGroupDetails groupDetails = new ReplySubmGroupDetails();
                    ReplyMessage reply = new ReplyMessage();


                    if (groupDetailResults.Entities.Count > 0)
                    {
                        //Group
                        AliasedValue GroupId = null;
                        AliasedValue GroupName = null;
                        AliasedValue GroupAssessor = null;
                        AliasedValue GroupSubmission = null;
                        if (groupDetailResults.Entities[0].Attributes.ContainsKey("Group.desnz_groupid"))
                        {
                            GroupId = (AliasedValue)groupDetailResults.Entities[0]["Group.desnz_groupid"];
                        }
                        if (groupDetailResults.Entities[0].Attributes.ContainsKey("Group.desnz_name"))
                        {
                            GroupName = (AliasedValue)groupDetailResults.Entities[0]["Group.desnz_name"];
                        }
                        if (groupDetailResults.Entities[0].Attributes.ContainsKey("Group.desnz_assessor"))
                        {
                            GroupAssessor = (AliasedValue)groupDetailResults.Entities[0]["Group.desnz_assessor"];
                        }
                        if (groupDetailResults.Entities[0].Attributes.ContainsKey("Group.desnz_submission"))
                        {
                            GroupSubmission = (AliasedValue)groupDetailResults.Entities[0]["Group.desnz_submission"];
                        }
                        SubmissionGroups group = new SubmissionGroups();
                        group.id = GroupId == null ? Guid.Empty : (Guid)GroupId.Value;
                        group.name = GroupName?.Value.ToString() ?? string.Empty;

                        group.assessor = new Person();
                        if (GroupAssessor != null && GroupAssessor.Value is EntityReference assessorEntityRef)
                        {
                            group.assessor.id = assessorEntityRef.Id;  // Get the Guid from EntityReference
                        }
                        else
                        {
                            group.assessor.id = Guid.Empty;  // Handle the case when it's null
                        }

                        group.submission = new Submission();
                        if (GroupSubmission != null && GroupSubmission.Value is EntityReference submissionEntityRef)
                        {
                            group.submission.id = submissionEntityRef.Id;  // Get the Guid from EntityReference
                        }
                        else
                        {
                            group.submission.id = Guid.Empty;  // Handle the case when it's null
                        }

                        // security check for submission id and group id
                        if (group.submission.id != submissionId)
                        {
                            reply.message = "Submission id of group id is not the same as the given Submission id";
                            return BadRequest(reply);
                        }


                        Entity lastGroupDetail = groupDetailResults.Entities[0];

                        if (lastGroupDetail.Contains("desnz_groupdetailid") && lastGroupDetail["desnz_groupdetailid"] != null)
                        {
                            groupDetails.id = lastGroupDetail.GetAttributeValue<Guid>("desnz_groupdetailid");
                        }

                        if (lastGroupDetail.Contains("desnz_assessmentstatus") && lastGroupDetail["desnz_assessmentstatus"] != null)
                        {
                            groupDetails.assessmentOutcome = lastGroupDetail.GetAttributeValue<OptionSetValue>("desnz_assessmentstatus").Value;
                        }

                        if (lastGroupDetail.Contains("desnz_changeneededcomment") && lastGroupDetail["desnz_changeneededcomment"] != null)
                        {
                            groupDetails.changeNeededComment = lastGroupDetail.GetAttributeValue<string>("desnz_changeneededcomment");
                        }

                        if (lastGroupDetail.Contains("desnz_sectionassessmentcomment") && lastGroupDetail["desnz_sectionassessmentcomment"] != null)
                        {
                            groupDetails.sectionAssessmentComment = lastGroupDetail.GetAttributeValue<string>("desnz_sectionassessmentcomment");
                        }

                    }

                    return Ok(groupDetails);

                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Error in GetAssessment API service call";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

    }
}
