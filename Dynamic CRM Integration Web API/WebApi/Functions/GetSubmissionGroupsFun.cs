using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Contracts;
using WebApi.Model;

namespace WebApi.Functions
{
    public static class GetSubmissionGroupsFun
    {
        //Fetch SubmissionGroups by submissionID and userRole
        public static async Task<List<ReplySubmissionGroups>> GetSubmissionGroups(Guid submissionId, int userRole, int submissionStatus, ServiceClient service)
        {

            List<ReplySubmissionGroups> subGroups = new List<ReplySubmissionGroups>(); // List of groups that get returned

            List<int> groupUserRoles = null; // GroupUserRoles of Groups that must be accounted for to be returned

            if (userRole == (int)Person.UserType.TechnicalAssessor)         // TA1
            {
                groupUserRoles = new List<int> {
                    (int)SubmissionGroups.GroupUserRole.All,
                    (int)SubmissionGroups.GroupUserRole.TA1,
                    (int)SubmissionGroups.GroupUserRole.TA1_TA2
                }; // All && (TA1 || TA2) && TA1-TA2 (mixed)
            }
            else if (userRole == (int)Person.UserType.TechnicalAssessor2)   // TA2
            {
                groupUserRoles = new List<int> {
                    (int)SubmissionGroups.GroupUserRole.All,
                    (int)SubmissionGroups.GroupUserRole.TA2,
                    (int)SubmissionGroups.GroupUserRole.TA1_TA2,
                    (int)SubmissionGroups.GroupUserRole.AA_TA2,


                }; // All && (TA1 || TA2) && TA1-TA2 (mixed)
            }
            else if (userRole == (int)Person.UserType.ResponsiblePerson)    // RP
            {
                groupUserRoles = new List<int> {
                    (int)SubmissionGroups.GroupUserRole.All,
                    (int)SubmissionGroups.GroupUserRole.RP
                }; // ALL && RP
            }
            else if (userRole == (int)Person.UserType.AssessorAdmin)        // AA
            {
                groupUserRoles = new List<int> {
                    (int)SubmissionGroups.GroupUserRole.All,
                    (int)SubmissionGroups.GroupUserRole.AA,
                    (int)SubmissionGroups.GroupUserRole.AA_TA2,
                }; // ALL && RP
            }


            //Fetch SubmissionGroups
            QueryExpression relatedquery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_status", "desnz_displayorder", "desnz_assessorstatus", "desnz_userrole"),

                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("desnz_submission", ConditionOperator.Equal, submissionId),
                        new ConditionExpression("desnz_userrole", ConditionOperator.In, groupUserRoles)
                    }
                }
            };

            // get group status of submission
            EntityCollection relatedGroupresults = await service.RetrieveMultipleAsync(relatedquery);

            foreach (Entity relatedEntity in relatedGroupresults.Entities)
            {
                ReplySubmissionGroups group = new ReplySubmissionGroups();

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

                // TODO UPDATE WITH NEW STATUSES BELOW CODE (MAKE ENUMS FOR SPECIFIC STATUSES WITH DIFFERENT GROUP TYPES)

                // if submission is return for changes do not add submit to assessor section
                // else if submission is not return for changes do not add return to assessor section and view TA1 comments section
                if (Enum.IsDefined(typeof(SubmissionGroups.GroupTypeOnlyForSubmitAssessment), group.groupType) && submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges)
                {
                    continue;
                }
                else if (Enum.IsDefined(typeof(SubmissionGroups.GroupTypeOnlyForReturndForChanges), group.groupType) && submissionStatus != (int)Submission.SubmissionStatus.ReturnedForChanges)
                {
                    continue;
                }
                else
                {
                    subGroups.Add(group);
                }
            }

            return subGroups;

        }
    }
}
