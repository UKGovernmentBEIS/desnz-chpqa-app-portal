using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;


namespace WebApi.Functions
{

    public static class UpdSectionStatusesFun
    {
        public static async Task ChangeSectionStatuses(Guid? idSubmission, int curGroupTypeNum, int curGroupCategoryNum, ServiceClient service, ILogger logger, ModeFlag mode = ModeFlag.Normal)
        {
            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_statuslocked", "desnz_status", "desnz_displayorder", "desnz_assessorstatus"),

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

            List<SubmissionGroups> groupsList = new List<SubmissionGroups>();

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

                if (relatedEntity.Attributes.ContainsKey("desnz_statuslocked"))
                {
                    group.statusLocked = relatedEntity.GetAttributeValue<bool?>("desnz_statuslocked");
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_status") && relatedEntity["desnz_status"] is OptionSetValue optionSetValuestatusLocked)
                {
                    group.status = optionSetValuestatusLocked.Value;
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

            // simple case for status to be completed
            if (!Enum.IsDefined(typeof(SubmissionGroups.GroupTypeWithNotApplicapleStatus), curGroupTypeNum))
            {

                // find and set the current group status to completed
                foreach (SubmissionGroups group in groupsList)
                {
                    if (group.groupType == curGroupTypeNum && group.status == (int)SubmissionGroups.StatusType.NotStarted && mode == ModeFlag.Normal)
                    {
                        group.status = (int)SubmissionGroups.StatusType.Completed;

                        Entity currentGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                        currentGroup["desnz_status"] = new OptionSetValue(group.status ?? (int)SubmissionGroups.StatusType.NotStarted);
                        //update DB group entry
                        await service.UpdateAsync(currentGroup);

                        logger.LogInformation("Updated current Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), currentGroup.Id.ToString());

                        break;
                    }
                    else if (group.groupType == curGroupTypeNum && group.status == (int)SubmissionGroups.StatusType.Completed &&
                        (group.groupType == (int)SubmissionGroups.GroupType.AddPrimeMoverDetails ||
                        group.groupType == (int)SubmissionGroups.GroupType.AddMeterDetails) &&
                        mode == ModeFlag.Delete)                                    // if delete or update logic for prime movers and meter
                    {
                        string entityName = "desnz_primemovers";
                        string entityId = "desnz_primemoversid";

                        if (group.groupType == (int)SubmissionGroups.GroupType.AddPrimeMoverDetails)    // prime movers / equipments
                        {
                            entityName = "desnz_primemovers";
                            entityId = "desnz_primemoversid";
                        }
                        else if (group.groupType == (int)SubmissionGroups.GroupType.AddMeterDetails)    // meters
                        {
                            entityName = "desnz_fuelmeters";
                            entityId = "desnz_fuelmetersid";
                        }

                        // for equipments or meters have to check if are all deleted to set the proper status
                        QueryExpression equipmentsQuery = new QueryExpression
                        {
                            EntityName = entityName, // Specify the name of the parent entity
                            ColumnSet = new ColumnSet(entityId),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                {
                                    new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                                }
                            }
                        };

                        EntityCollection equipmentOrMeterResults = await service.RetrieveMultipleAsync(equipmentsQuery);

                        if (equipmentOrMeterResults.Entities.Count == 0)    //if no results, user has deleted all in prime movers or meters so change to not started
                        {
                            group.status = (int)SubmissionGroups.StatusType.NotStarted;

                            Entity currentGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                            currentGroup["desnz_status"] = new OptionSetValue(group.status ?? (int)SubmissionGroups.StatusType.NotStarted);
                            //update DB group entry
                            await service.UpdateAsync(currentGroup);

                            logger.LogInformation("Updated current Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), currentGroup.Id.ToString());

                        }

                        break;
                    }
                }
                //TODO UPDATE STATUS (LOCKED) OF ENERGY HEAT POWER

                if (mode == ModeFlag.Delete)     // in case of deletion or update of a prime mover or meter
                {
                    foreach (SubmissionGroups group in groupsList)
                    {
                        // find and set the energy heat power to not started if it was inproggres or completed
                        if ((group.groupType == (int)SubmissionGroups.GroupType.ProvideEnergyInputs ||
                            group.groupType == (int)SubmissionGroups.GroupType.ProvideHeatOutputs ||
                            group.groupType == (int)SubmissionGroups.GroupType.ProvidePowerOutputs) &&
                            (group.status == (int)SubmissionGroups.StatusType.NotStarted ||
                            group.status == (int)SubmissionGroups.StatusType.InProgress ||
                            group.status == (int)SubmissionGroups.StatusType.Completed))
                        {

                            group.status = (int)SubmissionGroups.StatusType.NotStarted;

                            // if after the deletion or update of a meter (measure type) mainly
                            // check to see if there are any remaining energy heat or power to make status not applicable instead
                            string entityName = "desnz_fuelinputs";
                            string entityId = "desnz_fuelinputsid";
                            string entityAnnualTotal = "desnz_annualtotal";

                            if (group.groupType == (int)SubmissionGroups.GroupType.ProvideEnergyInputs)     // get Energy inputs
                            {
                                entityName = "desnz_fuelinputs";
                                entityId = "desnz_fuelinputsid";
                                entityAnnualTotal = "desnz_annualtotal";
                            }
                            else if (group.groupType == (int)SubmissionGroups.GroupType.ProvidePowerOutputs)    // get Power outputs
                            {
                                entityName = "desnz_poweroutputs";
                                entityId = "desnz_poweroutputsid";
                                entityAnnualTotal = "desnz_annualtotal";
                            }
                            else if (group.groupType == (int)SubmissionGroups.GroupType.ProvideHeatOutputs)    // get Heat outputs
                            {
                                entityName = "desnz_heatoutput";
                                entityId = "desnz_heatoutputid";
                                entityAnnualTotal = "desnz_annualtotal";
                            }

                            QueryExpression energyPowerHeatQuery = new QueryExpression
                            {
                                EntityName = entityName, // Specify the name of the parent entity
                                ColumnSet = new ColumnSet(entityId, "desnz_name", entityAnnualTotal),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                                    }
                                }
                            };

                            EntityCollection energyPowerHeatesults = await service.RetrieveMultipleAsync(energyPowerHeatQuery);

                            if (energyPowerHeatesults.Entities.Count == 0)
                            {
                                group.status = (int)SubmissionGroups.StatusType.NotApplicable;

                            }


                            Entity currentGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                            currentGroup["desnz_status"] = new OptionSetValue(group.status ?? (int)SubmissionGroups.StatusType.NotStarted);
                            //update DB group entry
                            await service.UpdateAsync(currentGroup);

                            logger.LogInformation("Updated current Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), currentGroup.Id.ToString());

                        }

                    }
                }



            }
            else        // update statuses for energy, heat, power
            {
                bool energyPowerHeatCompleted = true;
                bool energyPowerHeatInProgress = false;
                string entityName = "desnz_fuelinputs";
                string entityId = "desnz_fuelinputsid";
                string entityAnnualTotal = "desnz_annualtotal";

                if (curGroupTypeNum == (int)SubmissionGroups.GroupType.ProvideEnergyInputs)     // get Energy inputs
                {
                    entityName = "desnz_fuelinputs";
                    entityId = "desnz_fuelinputsid";
                    entityAnnualTotal = "desnz_annualtotal";
                }
                else if (curGroupTypeNum == (int)SubmissionGroups.GroupType.ProvidePowerOutputs)    // get Power outputs
                {
                    entityName = "desnz_poweroutputs";
                    entityId = "desnz_poweroutputsid";
                    entityAnnualTotal = "desnz_annualtotal";
                }
                else if (curGroupTypeNum == (int)SubmissionGroups.GroupType.ProvideHeatOutputs)    // get Heat outputs
                {
                    entityName = "desnz_heatoutput";
                    entityId = "desnz_heatoutputid";
                    entityAnnualTotal = "desnz_annualtotal";
                }

                QueryExpression energyPowerHeatQuery = new QueryExpression
                {
                    EntityName = entityName, // Specify the name of the parent entity
                    ColumnSet = new ColumnSet(entityId, "desnz_name", entityAnnualTotal),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                        }
                    }
                };

                EntityCollection energyPowerHeatesults = await service.RetrieveMultipleAsync(energyPowerHeatQuery);

                foreach (Entity entity in energyPowerHeatesults.Entities)
                {
                    decimal? energyPowerHeatAnnualTotal = entity.GetAttributeValue<decimal?>(entityAnnualTotal);

                    if (energyPowerHeatAnnualTotal == null || energyPowerHeatAnnualTotal <= 0)
                    {
                        energyPowerHeatCompleted = false;
                    }
                    else if (energyPowerHeatAnnualTotal > 0)
                    {
                        energyPowerHeatInProgress = true;
                    }
                }

                // find and set the current group status to completed or in progress
                foreach (SubmissionGroups group in groupsList)
                {
                    if (group.groupType == curGroupTypeNum && group.status != null)
                    {
                        if (group.status == (int)SubmissionGroups.StatusType.NotApplicable && energyPowerHeatesults.Entities.Count > 0)
                        {
                            group.status = (int)SubmissionGroups.StatusType.CannotStartYet;
                        }
                        else if (group.status != null && group.status != (int)SubmissionGroups.StatusType.NotApplicable && energyPowerHeatesults.Entities.Count == 0)
                        {
                            group.status = (int)SubmissionGroups.StatusType.NotApplicable;
                        }
                        else if (group.status == (int)SubmissionGroups.StatusType.NotStarted || group.status == (int)SubmissionGroups.StatusType.InProgress ||
                            group.status == (int)SubmissionGroups.StatusType.Completed && energyPowerHeatesults.Entities.Count > 0)
                        {
                            group.status = energyPowerHeatCompleted ? (int)SubmissionGroups.StatusType.Completed : energyPowerHeatInProgress ? (int)SubmissionGroups.StatusType.InProgress : (int)SubmissionGroups.StatusType.NotStarted;
                        }

                        Entity currentGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                        currentGroup["desnz_status"] = new OptionSetValue(group.status ?? (int)SubmissionGroups.StatusType.NotStarted);
                        //update DB group entry
                        await service.UpdateAsync(currentGroup);

                        logger.LogInformation("Updated current Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), currentGroup.Id.ToString());

                        break;
                    }
                }

            }



            // TODO update statuses for energy heat power Delete ?


            // check SchemeDetails AND SchemeCapacityDetails, if completed then
            // open the SchemePerformanceDetails AND CertificatesAndBenefitsDetails AND ThresholdDetails (this mean SelectQualityIndexThreshold specific section)
            bool SchemeDetailsAndSchemeCapacityDetailsCompleted = true;

            if (curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.SchemeDetails || curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails || curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails)
            {
                foreach (SubmissionGroups group in groupsList)
                {
                    if ((group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeDetails ||
                        group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails) && group.status != (int)SubmissionGroups.StatusType.Completed && group.status != null)
                    {
                        SchemeDetailsAndSchemeCapacityDetailsCompleted = false;
                        break;
                    }
                }
                if (SchemeDetailsAndSchemeCapacityDetailsCompleted)
                {
                    foreach (SubmissionGroups group in groupsList)
                    {
                        if ((group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails ||
                            group.groupCategory == (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails ||
                            group.groupCategory == (int)SubmissionGroups.GroupCategory.ThresholdDetails) && group.status == (int)SubmissionGroups.StatusType.CannotStartYet)
                        {
                            group.status = (int)SubmissionGroups.StatusType.NotStarted;

                            Entity nextSectionGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                            nextSectionGroup["desnz_status"] = new OptionSetValue(group.status ?? 0);
                            //update DB group entry
                            await service.UpdateAsync(nextSectionGroup);

                            logger.LogInformation("Updated Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), nextSectionGroup.Id.ToString());

                        }
                    }
                }
            }



            // check SchemeDetails AND SchemeCapacityDetails AND SchemePerformanceDetails AND CertificatesAndBenefitsDetails AND ThresholdDetails if completed/inapplicable then open the SubmitToAssessor
            bool AllDetailsCompleted = true;

            if (curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.SchemeDetails ||
                curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails ||
                curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails ||
                curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails ||
                curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.ThresholdDetails ||
                curGroupCategoryNum == (int)SubmissionGroups.GroupCategory.AssessorComments)
            {
                foreach (SubmissionGroups group in groupsList)
                {
                    if ((group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeDetails ||
                        group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails ||
                        group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails ||
                        group.groupCategory == (int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails ||
                        group.groupCategory == (int)SubmissionGroups.GroupCategory.ThresholdDetails) &&
                        group.status != (int)SubmissionGroups.StatusType.Completed && group.status != (int)SubmissionGroups.StatusType.NotApplicable && group.status != null)
                    {
                        AllDetailsCompleted = false;
                        break;
                    }
                }
                bool assessorCommentsCompleted = false;
                if (AllDetailsCompleted)
                {
                    foreach (SubmissionGroups group in groupsList)
                    {
                        if (group.groupCategory == (int)SubmissionGroups.GroupCategory.SubmitToAssessor && group.status == (int)SubmissionGroups.StatusType.CannotStartYet) //First time RP sends scheme
                        {
                            group.status = (int)SubmissionGroups.StatusType.NotStarted;

                            Entity nextSectionGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                            nextSectionGroup["desnz_status"] = new OptionSetValue(group.status ?? 0);
                            //update DB group entry
                            await service.UpdateAsync(nextSectionGroup);

                            logger.LogInformation("Updated Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), nextSectionGroup.Id.ToString());

                        }
                        if (group.groupType == (int)SubmissionGroups.GroupType.ReviewAssessorCommentsRP && group.status == (int)SubmissionGroups.StatusType.Completed)
                        {
                            assessorCommentsCompleted = true; //Review Assessor Comments completed
                        }
                        if (assessorCommentsCompleted && group.groupCategory == (int)SubmissionGroups.GroupCategory.ReturnToAssessor && 
                            group.status == (int)SubmissionGroups.StatusType.CannotStartYet) //RP RE-Sends scheme to RP after return
                        {
                            group.status = (int)SubmissionGroups.StatusType.NotStarted;

                            Entity nextSectionGroup = new Entity("desnz_group", group.id ?? Guid.Empty);                      // get status group
                            nextSectionGroup["desnz_status"] = new OptionSetValue(group.status ?? 0);
                            //update DB group entry
                            await service.UpdateAsync(nextSectionGroup);

                            logger.LogInformation("Updated Submission Group at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), nextSectionGroup.Id.ToString());
                        }
                    }
                }
            }



            logger.LogInformation("Updated Submission Groups at {DT} of Submission with id :  {id}", DateTime.UtcNow.ToLongTimeString(), idSubmission.ToString());


        }

        public static async Task<bool> SectionStatusesForBulkImport(Guid? idSubmission, ServiceClient service, ILogger logger)
        {

            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_name", "desnz_submittedname", "desnz_submission", "desnz_groupcategory", "desnz_grouptype", "desnz_statuslocked", "desnz_status", "desnz_displayorder", "desnz_assessorstatus"),

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

            List<SubmissionGroups> groupsList = new List<SubmissionGroups>();

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

                if (relatedEntity.Attributes.ContainsKey("desnz_statuslocked"))
                {
                    group.statusLocked = relatedEntity.GetAttributeValue<bool?>("desnz_statuslocked");
                }
                if (relatedEntity.Attributes.ContainsKey("desnz_status") && relatedEntity["desnz_status"] is OptionSetValue optionSetValuestatusLocked)
                {
                    group.status = optionSetValuestatusLocked.Value;
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

            bool F2Completed = true;

            // check if groups statuses from SchemeDetails and SchemeCapacityDetails are completed
            foreach (SubmissionGroups group in groupsList)
            {
                if (group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeDetails ||
                    group.groupCategory == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails)
                {
                    if (group.status != (int)SubmissionGroups.StatusType.Completed &&
                        group.status != null)
                    {
                        F2Completed = false;
                        break;
                    }
                }
            }

            return F2Completed;

        }

        public static async Task ResetRPGroups(Guid? idSubmission, ServiceClient service)
        {

            int[] groupTypes = { (int)SubmissionGroups.GroupType.ReviewAssessorCommentsRP, (int)SubmissionGroups.GroupType.ReturnToAssessor };
            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_groupcategory", "desnz_grouptype", "desnz_status"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission ),
                            new ConditionExpression("desnz_grouptype", ConditionOperator.In, groupTypes )
                        }
                }
            };

            // get group status of submission
            EntityCollection groupsResults = await service.RetrieveMultipleAsync(groupsQuery);

            foreach (Entity relatedEntity in groupsResults.Entities)
            {
                if (relatedEntity.Contains("desnz_grouptype") && relatedEntity["desnz_grouptype"] is OptionSetValue optionSetValueGroupType)
                {
                    int groupType = optionSetValueGroupType.Value;

                    // Determine if this entity should be updated based on groupType
                    int? newStatus = null;
                    if (groupType == (int)SubmissionGroups.GroupType.ReviewAssessorCommentsRP)
                    {
                        newStatus = (int)SubmissionGroups.StatusType.NotStarted;
                    }
                    else if (groupType == (int)SubmissionGroups.GroupType.ReturnToAssessor)
                    {
                        newStatus = (int)SubmissionGroups.StatusType.CannotStartYet;
                    }

                    // If a status update is needed, perform the update directly
                    if (newStatus.HasValue)
                    {
                        Entity groupToUpdate = new Entity("desnz_group", relatedEntity.Id);
                        groupToUpdate["desnz_status"] = new OptionSetValue(newStatus.Value);
                        await service.UpdateAsync(groupToUpdate);
                    }
                }
            }
        }

        //Turn specific Group Status to Completed for specific idSubmission and GroupTypeNumber
        public static async Task CompleteGroup(Guid? idSubmission, int curGroupTypeNum, ServiceClient service)
        {

            // group section query
            QueryExpression groupsQuery = new QueryExpression
            {
                EntityName = "desnz_group", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_groupid", "desnz_groupcategory", "desnz_grouptype", "desnz_assessorstatus"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission ),
                            new ConditionExpression("desnz_grouptype", ConditionOperator.Equal, curGroupTypeNum )
                        }
                },
                TopCount = 1,
            };

            // get group status of submission
            EntityCollection groupsResults = await service.RetrieveMultipleAsync(groupsQuery);

            if (groupsResults.Entities.Count > 0)
            {
                Entity groupToUpdate = groupsResults.Entities[0];

                groupToUpdate["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.Completed);

                await service.UpdateAsync(groupToUpdate);
            }
        }


        public enum ModeFlag
        {
            Normal = 0,
            Delete = 1,
        }
    }


}
