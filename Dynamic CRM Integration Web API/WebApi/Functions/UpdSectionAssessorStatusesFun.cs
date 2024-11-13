using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;


namespace WebApi.Functions
{

    public class UpdSectionAssessorStatusesFun
    {
        public static async Task UpdSectionAssessorStatuses(Guid? idSubmission, int curGroupTypeNum, int curGroupCategoryNum, ServiceClient service, ILogger logger)
        {
            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_status", "desnz_displayorder", "desnz_assessorstatus"),

                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal,  idSubmission )
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


            bool AllDetailsCompleted = true;

            // if group is from SchemeDetails SchemeCapacityDetails SchemePerformanceDetails CertificatesAndBenefitsDetails ThresholdDetails

            foreach (SubmissionGroups group in groupsList)
            {
                // If group belongs to one of 5 group categories and IS NOT APPROVED or NEEDS CHANGE or REJECTED then false
                if ((group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.ThresholdDetails) &&
                    group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted)
                {
                    AllDetailsCompleted = false;
                    break;
                }
            }


            // if true open AuditRecommendation
            if (AllDetailsCompleted)
            {
                bool auditComplete = false;
                Entity groupEntity = null;
                foreach (SubmissionGroups group in groupsList)
                {

                    if (group.groupType == (int)SubmissionGroups.GroupType.AuditRecommendation && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.CannotStartYet)
                    {
                        group.assessorStatus = (int)SubmissionGroups.AssessorStatus.NotStarted;
                        groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                        groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.CannotStartYet);
                        await service.UpdateAsync(groupEntity);
                        logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                        break;
                    }
                }

                // if we are at AuditRecommendation and status not started complete it
                if (curGroupTypeNum == (int)SubmissionGroups.GroupType.AuditRecommendation && AllDetailsCompleted)
                {
                    foreach (SubmissionGroups group in groupsList)
                    {
                        if (group.groupType == (int)SubmissionGroups.GroupType.AuditRecommendation && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted)
                        {
                            group.assessorStatus = (int)SubmissionGroups.AssessorStatus.Completed;
                            groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                            groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.CannotStartYet);
                            await service.UpdateAsync(groupEntity);
                            logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                        }

                        if (group.groupType == (int)SubmissionGroups.GroupType.AuditRecommendation && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.Completed)
                        {
                            auditComplete = true;
                        }

                        // if all details have assessment and audit is complete make submit assessment not started
                        if (group.groupType == (int)SubmissionGroups.GroupType.SubmitAssessment && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.CannotStartYet && auditComplete)
                        {
                            group.assessorStatus = (int)SubmissionGroups.AssessorStatus.NotStarted;
                            groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                            groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.CannotStartYet);
                            await service.UpdateAsync(groupEntity);
                            logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                            break;
                        }

                    }
                }


                // if we are at SubmitAssessment and status not started complete it
                if (curGroupTypeNum == (int)SubmissionGroups.GroupType.SubmitAssessment)
                {
                    foreach (SubmissionGroups group in groupsList)
                    {
                        if (group.groupType == (int)SubmissionGroups.GroupType.AuditRecommendation && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.Completed)
                        {
                            auditComplete = true;
                        }

                        if (group.groupType == (int)SubmissionGroups.GroupType.SubmitAssessment && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted && auditComplete)
                        {
                            group.assessorStatus = (int)SubmissionGroups.AssessorStatus.Completed;
                            groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                            groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.CannotStartYet);
                            await service.UpdateAsync(groupEntity);
                            logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                            break;
                        }
                    }
                }
            }

        }

        /// <summary>
        /// Call this after RP submits a Submision,
        /// will set the assessor status of energy, power, heat inputs/outputs not started if ther are NOT not applicable in RP status
        /// </summary>
        /// <param name="idSubmission"></param>
        /// <param name="service"></param>
        /// <param name="logger"></param>
        /// <returns></returns>
        public static async Task UpdEnergyPowerHeatSectionAssessorStatuses(Guid? idSubmission, ServiceClient service, ILogger logger)
        {
            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_status", "desnz_displayorder", "desnz_assessorstatus"),

                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal,  idSubmission )
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

            Entity groupEntity = null;

            // set the assessor status of energy, power, heat inputs/outputs not started if ther are NOT not applicable in RP status
            foreach (SubmissionGroups group in groupsList)
            {
                if (group.groupType == (int)SubmissionGroups.GroupType.ProvideEnergyInputs ||
                    group.groupType == (int)SubmissionGroups.GroupType.ProvidePowerOutputs ||
                    group.groupType == (int)SubmissionGroups.GroupType.ProvideHeatOutputs)
                {
                    if (group.status != (int)SubmissionGroups.StatusType.NotApplicable)
                    {
                        group.assessorStatus = (int)SubmissionGroups.AssessorStatus.NotStarted;
                        groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                        groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.NotApplicable);
                        await service.UpdateAsync(groupEntity);
                        logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                    }

                }
            }



        }



        public static async Task UpdSectionAssessor2Statuses(Guid? idSubmission, int curGroupTypeNum, int curGroupCategoryNum, ServiceClient service, ILogger logger)
        {
            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_status", "desnz_displayorder", "desnz_assessorstatus"),

                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal,  idSubmission )
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


            bool AllDetailsCompleted = true;

            // if group is from SchemeDetails SchemeCapacityDetails SchemePerformanceDetails CertificatesAndBenefitsDetails ThresholdDetails

            foreach (SubmissionGroups group in groupsList)
            {
                // If group belongs to one of 5 group categories and IS NOT APPROVED or NEEDS CHANGE or REJECTED then false
                if ((group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.ThresholdDetails) &&
                    group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted)
                {
                    AllDetailsCompleted = false;
                    break;
                }
            }


            // if true open AuditRecommendation
            if (AllDetailsCompleted)
            {
                Entity groupEntity = null;
                bool AllCompleted = true;

                // if Assessor Comments is not started then complete it
                if (curGroupTypeNum == (int)SubmissionGroups.GroupType.ReviewAssessorCommentsTA2)
                {

                    foreach (SubmissionGroups group in groupsList)
                    {
                        // If group belongs to AssessorComments and is not started complete it
                        if (group.groupType == (int)SubmissionGroups.GroupType.ReviewAssessorCommentsTA2 && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted)
                        {
                            group.assessorStatus = (int)SubmissionGroups.AssessorStatus.Completed;
                            groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                            groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.NotStarted);
                            await service.UpdateAsync(groupEntity);
                            logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                            break;
                        }
                    }

                    // check all assessor 2 statuses if completed
                    foreach (SubmissionGroups group in groupsList)
                    {
                        // If group belongs to AssessorComments and is not started mark it
                        if (group.groupType == (int)SubmissionGroups.GroupType.ReviewAssessorCommentsTA2 && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted)
                        {
                            AllCompleted = false;
                        }
                    }

                    foreach (SubmissionGroups group in groupsList)
                    {
                        // If group belongs to Assessment Decision and it is cannot start yet make it not started
                        if (group.groupType == (int)SubmissionGroups.GroupType.AssessmentDecision && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.CannotStartYet && AllCompleted)
                        {
                            group.assessorStatus = (int)SubmissionGroups.AssessorStatus.NotStarted;
                            groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                            groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.CannotStartYet);
                            await service.UpdateAsync(groupEntity);
                            logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                            break;
                        }
                    }
                }





                // if assessment decision is not started then complete it
                if (curGroupTypeNum == (int)SubmissionGroups.GroupType.AssessmentDecision)
                {

                    foreach (SubmissionGroups group in groupsList)
                    {
                        if (group.groupType == (int)SubmissionGroups.GroupType.AssessmentDecision && group.assessorStatus == (int)SubmissionGroups.AssessorStatus.NotStarted)
                        {
                            group.assessorStatus = (int)SubmissionGroups.AssessorStatus.Completed;
                            groupEntity = new Entity("desnz_group", group.id ?? Guid.Empty);
                            groupEntity["desnz_assessorstatus"] = new OptionSetValue(group.assessorStatus ?? (int)SubmissionGroups.AssessorStatus.CannotStartYet);
                            await service.UpdateAsync(groupEntity);
                            logger.LogInformation("Updated Submission Group at {DT} with id: {id}", DateTime.UtcNow.ToLongTimeString(), groupEntity.Id.ToString());
                            break;
                        }
                    }
                }
            }
        }
    }
}

