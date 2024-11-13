using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;
using static WebApi.Controllers.GetAssessCommentsTA1;


namespace WebApi.Functions
{

    public class CheckSubmAssessStatusFun
    {
        public static async Task<ReplyAssessCommentsTA1> CheckSubmAssessStatusFromList(Guid? idSubmission, ServiceClient service, ILogger logger)
        {

            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_status", "desnz_assessorstatus", "desnz_displayorder"),

                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                        }
                }
            };

            // get group status of submission
            EntityCollection groupsResults = await service.RetrieveMultipleAsync(groupsQuery);

            List<SubmissionGroups> groupsList = new List<SubmissionGroups>(); //List of Groups for submission


            // Mapping
            foreach (Entity relatedEntity in groupsResults.Entities)
            {
                SubmissionGroups group = new SubmissionGroups();

                group.id = relatedEntity.GetAttributeValue<Guid>("desnz_groupid");

                group.name = relatedEntity.GetAttributeValue<string>("desnz_name");
                group.submittedName = relatedEntity.GetAttributeValue<string>("desnz_submittedname");

                if (relatedEntity.Attributes.ContainsKey("desnz_groupcategory") && relatedEntity["desnz_groupcategory"] is OptionSetValue optionSetValuegroupCategory)
                {
                    group.groupCategory = optionSetValuegroupCategory.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_grouptype") && relatedEntity["desnz_grouptype"] is OptionSetValue optionSetValuegroupType)
                {
                    group.groupType = optionSetValuegroupType.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_status") && relatedEntity["desnz_status"] is OptionSetValue optionSetValuestatus)
                {
                    group.status = optionSetValuestatus.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_assessorstatus") && relatedEntity["desnz_assessorstatus"] is OptionSetValue optionSetValueassessorstatus)
                {
                    group.assessorStatus = optionSetValueassessorstatus.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_displayorder"))
                {
                    group.displayOrder = relatedEntity.GetAttributeValue<int>("desnz_displayorder");
                }

                groupsList.Add(group);
            }


            ReplyAssessCommentsTA1 replyAssessCommentsTA1 = new ReplyAssessCommentsTA1();

            replyAssessCommentsTA1.submissionStatus = (int)Submission.SubmissionStatus.Approved;

            // set the status of the submission at the moment
            foreach (SubmissionGroups group in groupsList)
            {
                if (group.assessorStatus == (int)SubmissionGroups.AssessorStatus.Rejected)
                {
                    replyAssessCommentsTA1.submissionStatus = (int)Submission.SubmissionStatus.Rejected;
                    break;
                }
                else if (group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NeedsChange)
                {
                    replyAssessCommentsTA1.submissionStatus = (int)Submission.SubmissionStatus.ReturnedForChanges;
                }
            }

            replyAssessCommentsTA1.groupList = new List<ReplySubmissionGroupCommentsTA1>();



            // for each group
            foreach (SubmissionGroups group in groupsList)
            {
                // get latest groupDetail
                QueryExpression groupQuery = new QueryExpression
                {
                    EntityName = "desnz_groupdetail",
                    ColumnSet = new ColumnSet("desnz_assessmentstatus", "desnz_sectionassessmentcomment", "desnz_changeneededcomment", "desnz_groupdetailid", "desnz_group"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_group", ConditionOperator.Equal, group.id)
                        }
                    }
                };
                groupQuery.AddOrder("createdon", OrderType.Descending);

                EntityCollection groupDetailResults = await service.RetrieveMultipleAsync(groupQuery);

                // if we have group details take the latest
                if (groupDetailResults.Entities.Count > 0)
                {
                    ReplySubmissionGroupCommentsTA1 replyGourp = new ReplySubmissionGroupCommentsTA1();

                    replyGourp.id = group.id;
                    replyGourp.name = group.name;
                    replyGourp.submittedName = group.submittedName;
                    replyGourp.groupCategory = group.groupCategory;
                    replyGourp.groupType = group.groupType;
                    replyGourp.displayOrder = group.displayOrder;
                    replyGourp.assessorStatus = group.assessorStatus;

                    // if submission status is return for changes take the return for changes comment
                    if (replyAssessCommentsTA1.submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges)
                    {
                        if (groupDetailResults.Entities[0].Contains("desnz_changeneededcomment") && groupDetailResults.Entities[0]["desnz_changeneededcomment"] != null)
                        {
                            replyGourp.AssessmentComment = groupDetailResults.Entities[0].GetAttributeValue<string>("desnz_changeneededcomment");
                            replyAssessCommentsTA1.groupList.Add(replyGourp);
                        }
                    }
                    else    // if submission status is reject or approve take the TA1 section comment
                    {
                        if (groupDetailResults.Entities[0].Contains("desnz_sectionassessmentcomment") && groupDetailResults.Entities[0]["desnz_sectionassessmentcomment"] != null)
                        {
                            replyGourp.AssessmentComment = groupDetailResults.Entities[0].GetAttributeValue<string>("desnz_sectionassessmentcomment");
                            replyAssessCommentsTA1.groupList.Add(replyGourp);
                        }
                    }
                }
            }

            return replyAssessCommentsTA1;
        }

        public static async Task<ReplyAssessCommentsTA1> CheckSubmAssessStatus(int userType, Guid? idSubmission, ServiceClient service, ILogger logger)
        {


            ReplyAssessCommentsTA1 replyAssessCommentsTA1 = new ReplyAssessCommentsTA1();

            replyAssessCommentsTA1.groupList = new List<ReplySubmissionGroupCommentsTA1>();

            // get submission status
            Entity submissiomnResult = await service.RetrieveAsync("desnz_submission", idSubmission ?? Guid.Empty, new ColumnSet("desnz_submissionid", "desnz_status"));

            // set the status of the submission at the moment
            if (submissiomnResult.Attributes.ContainsKey("desnz_status") && submissiomnResult["desnz_status"] is OptionSetValue optionSetValueSubmissionStatus)
            {
                replyAssessCommentsTA1.submissionStatus = optionSetValueSubmissionStatus.Value;
            }

            if (userType == (int)Person.UserType.ResponsiblePerson && replyAssessCommentsTA1.submissionStatus != (int)Submission.SubmissionStatus.ReturnedForChanges)
            {
                return replyAssessCommentsTA1;
            }


            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_status", "desnz_assessorstatus", "desnz_displayorder"),

                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                        }
                }
            };

            // get group status of submission
            EntityCollection groupsResults = await service.RetrieveMultipleAsync(groupsQuery);

            List<SubmissionGroups> groupsList = new List<SubmissionGroups>(); // List of Groups for submission

            // Mapping
            foreach (Entity relatedEntity in groupsResults.Entities)
            {
                SubmissionGroups group = new SubmissionGroups();

                group.id = relatedEntity.GetAttributeValue<Guid>("desnz_groupid");

                group.name = relatedEntity.GetAttributeValue<string>("desnz_name");
                group.submittedName = relatedEntity.GetAttributeValue<string>("desnz_submittedname");

                if (relatedEntity.Attributes.ContainsKey("desnz_groupcategory") && relatedEntity["desnz_groupcategory"] is OptionSetValue optionSetValuegroupCategory)
                {
                    group.groupCategory = optionSetValuegroupCategory.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_grouptype") && relatedEntity["desnz_grouptype"] is OptionSetValue optionSetValuegroupType)
                {
                    group.groupType = optionSetValuegroupType.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_status") && relatedEntity["desnz_status"] is OptionSetValue optionSetValuestatus)
                {
                    group.status = optionSetValuestatus.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_assessorstatus") && relatedEntity["desnz_assessorstatus"] is OptionSetValue optionSetValueassessorstatus)
                {
                    group.assessorStatus = optionSetValueassessorstatus.Value;
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_displayorder"))
                {
                    group.displayOrder = relatedEntity.GetAttributeValue<int>("desnz_displayorder");
                }

                groupsList.Add(group);
            }

            // for each group
            foreach (SubmissionGroups group in groupsList)
            {
                // get latest groupDetail
                QueryExpression groupQuery = new QueryExpression
                {
                    EntityName = "desnz_groupdetail",
                    ColumnSet = new ColumnSet("desnz_assessmentstatus", "desnz_sectionassessmentcomment", "desnz_changeneededcomment", "desnz_groupdetailid", "desnz_group"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_group", ConditionOperator.Equal, group.id)
                        }
                    }
                };
                groupQuery.AddOrder("createdon", OrderType.Descending);

                EntityCollection groupDetailResults = await service.RetrieveMultipleAsync(groupQuery);

                // if we have group details take the latest
                if (groupDetailResults.Entities.Count > 0)
                {
                    ReplySubmissionGroupCommentsTA1 replyGourp = new ReplySubmissionGroupCommentsTA1();

                    replyGourp.id = group.id;
                    replyGourp.name = group.name;
                    replyGourp.submittedName = group.submittedName;
                    replyGourp.groupCategory = group.groupCategory;
                    replyGourp.groupType = group.groupType;
                    replyGourp.displayOrder = group.displayOrder;
                    replyGourp.assessorStatus = group.assessorStatus;

                    // if submission status is return for changes take the return for changes comment
                    if (replyAssessCommentsTA1.submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges)
                    {
                        if (groupDetailResults.Entities[0].Contains("desnz_changeneededcomment") && groupDetailResults.Entities[0]["desnz_changeneededcomment"] != null)
                        {
                            replyGourp.AssessmentComment = groupDetailResults.Entities[0].GetAttributeValue<string>("desnz_changeneededcomment");
                            replyAssessCommentsTA1.groupList.Add(replyGourp);
                        }
                    }
                    else    // if submission status is reject or approve take the TA1 section comment
                    {
                        if (groupDetailResults.Entities[0].Contains("desnz_sectionassessmentcomment") && groupDetailResults.Entities[0]["desnz_sectionassessmentcomment"] != null)
                        {
                            replyGourp.AssessmentComment = groupDetailResults.Entities[0].GetAttributeValue<string>("desnz_sectionassessmentcomment");
                            replyAssessCommentsTA1.groupList.Add(replyGourp);
                        }
                    }
                }
            }


            return replyAssessCommentsTA1;
        }

    }
}

