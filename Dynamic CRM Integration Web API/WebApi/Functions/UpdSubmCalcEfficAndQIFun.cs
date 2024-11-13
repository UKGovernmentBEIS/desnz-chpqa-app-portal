using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Contracts;
using WebApi.Model;
using static WebApi.Controllers.GetEquipmentListBySubmissionId;

namespace WebApi.Functions
{

    public static class UpdSubmCalcEfficAndQIFun
    {
        public static async Task CalculateAsync(Guid? idSubmission, ServiceClient service)
        {

            ReplySubmission submission = new ReplySubmission();

            Entity resultSubmission = await service.RetrieveAsync("desnz_submission", idSubmission ?? Guid.Empty, 
                new ColumnSet("desnz_submissionid", "desnz_submissionformtype", "desnz_chptotalpowercapacity", "desnz_totalfuelandenergyinputsmwh", 
                "desnz_totalpowergeneratedmwh", "desnz_qualifyingheatoutputmwh", "desnz_power", "desnz_heat", "desnz_thepowerefficiencythresholdforyourschemeis",
                "desnz_didyourschemeachievethepowerefficiencythres", "desnz_whatistheqithresholdforyourscheme", "desnz_foi", "desnz_fop", "desnz_foh"

                ));

            submission.id = resultSubmission.GetAttributeValue<Guid>("desnz_submissionid");
            if (resultSubmission.Attributes.ContainsKey("desnz_submissionformtype") && resultSubmission["desnz_submissionformtype"] is OptionSetValue optionSetValueSubmissionFormType)
            {
                submission.submissionFormType = optionSetValueSubmissionFormType.Value;
            }
            submission.chpTotalPowerCapacity = resultSubmission.GetAttributeValue<double?>("desnz_chptotalpowercapacity");

            submission.totalFuelEnergyInputs = resultSubmission.GetAttributeValue<decimal?>("desnz_totalfuelandenergyinputsmwh");
            submission.totalPowerGenerated = resultSubmission.GetAttributeValue<decimal?>("desnz_totalpowergeneratedmwh");
            submission.qualifyingHeatOutput = resultSubmission.GetAttributeValue<decimal?>("desnz_qualifyingheatoutputmwh");

            submission.FOI = resultSubmission.GetAttributeValue<decimal?>("desnz_foi");
            submission.FOP = resultSubmission.GetAttributeValue<decimal?>("desnz_fop");
            submission.FOH = resultSubmission.GetAttributeValue<decimal?>("desnz_foh");

            submission.powerEfficiency = resultSubmission.GetAttributeValue<decimal?>("desnz_power");
            submission.heatEfficiency = resultSubmission.GetAttributeValue<decimal?>("desnz_heat");

            submission.powerEfficiencyThreshold = resultSubmission.GetAttributeValue<decimal?>("desnz_thepowerefficiencythresholdforyourschemeis");
            submission.achivePowerEfficiencyThreshold = resultSubmission.GetAttributeValue<bool?>("desnz_didyourschemeachievethepowerefficiencythres");

            submission.qualityIndexThreshold = resultSubmission.GetAttributeValue<decimal?>("desnz_whatistheqithresholdforyourscheme");

            // calculations for power and heat efficiencies
            if (submission.submissionFormType == (int)Submission.SubmissionFormType.F4s)     // if simple form
            {

                // get heat outputs, if null calculate the  qualifyingHeatOutput from equipments units sum of (Total Power Capacity * max Heat to power Ratio) per unit

                // Heat Outputs
                QueryExpression heatOutputsQuery = new QueryExpression
                {
                    EntityName = "desnz_heatoutput", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("desnz_heatoutputid", "desnz_annualtotal"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, submission.id )
                        }
                    }
                };

                EntityCollection heatOutputsResults = await service.RetrieveMultipleAsync(heatOutputsQuery);

                if (heatOutputsResults.Entities.Count == 0)
                {

                    // EQUIPMENTS

                    QueryExpression equipmentsUnitsQuery = new QueryExpression
                    {
                        EntityName = "desnz_primemovers", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_primemoversid", "desnz_unit"),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_primemovers", // Parent entity
                                LinkFromAttributeName = "desnz_unit", // Parent entity attribute
                                LinkToEntityName = "desnz_unit", // Related entity
                                LinkToAttributeName = "desnz_unitid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_unitid", "desnz_name", "desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw",
                                    "desnz_fuelinputkw", "desnz_powerefficiency", "desnz_maxheattopowerratio", "desnz_maxheatefficiency",
                                    "desnz_maxoverallefficiency"),
                                EntityAlias = "Unit"
                            }
                        },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, submission.id )
                            }
                        }
                    };

                    EntityCollection equipmentsUnitsresults = await service.RetrieveMultipleAsync(equipmentsUnitsQuery);

                    decimal sumOfTotalPowerCapMultMaxHeatToPowerRatioMW = 0.0m;

                    foreach (Entity entity in equipmentsUnitsresults.Entities)
                    {
                        ReplyEquipment equipment = new ReplyEquipment();

                        equipment.id = entity.GetAttributeValue<Guid>("desnz_primemoversid");

                        AliasedValue UnitId = (AliasedValue)entity["Unit.desnz_unitid"];
                        AliasedValue UnitName = (AliasedValue)entity["Unit.desnz_name"];

                        AliasedValue UnitTotalPowerCapacityKw = (AliasedValue)entity["Unit.desnz_totalpowercapacitykw"];
                        AliasedValue UnitTotalHeatCapacityKw = (AliasedValue)entity["Unit.desnz_totalheatcapacitykw"];
                        AliasedValue UnitFuelInputKw = (AliasedValue)entity["Unit.desnz_fuelinputkw"];
                        AliasedValue UnitPowerEfficiency = (AliasedValue)entity["Unit.desnz_powerefficiency"];
                        AliasedValue UnitMaxHeatToPowerRatio = (AliasedValue)entity["Unit.desnz_maxheattopowerratio"];
                        AliasedValue UnitMaxHeatEfficiency = (AliasedValue)entity["Unit.desnz_maxheatefficiency"];
                        AliasedValue UnitMaxOverallEfficiency = (AliasedValue)entity["Unit.desnz_maxoverallefficiency"];

                        equipment.unit = new ReplyUnit();
                        equipment.unit.totalPowerCapacityKw = UnitTotalPowerCapacityKw == null ? 0.0 : (double)UnitTotalPowerCapacityKw.Value;
                        equipment.unit.totalHeatCapacityKw = UnitTotalHeatCapacityKw == null ? 0.0 : (double)UnitTotalHeatCapacityKw?.Value;
                        equipment.unit.fuelInputKw = UnitFuelInputKw == null ? 0.0 : (double)UnitFuelInputKw?.Value;
                        equipment.unit.powerEfficiency = UnitPowerEfficiency == null ? 0.0 : (double)UnitPowerEfficiency?.Value;
                        equipment.unit.maxHeatToPowerRatio = UnitMaxHeatToPowerRatio == null ? 0.0 : (double)UnitMaxHeatToPowerRatio?.Value;
                        equipment.unit.maxHeatEfficiency = UnitMaxHeatEfficiency == null ? 0.0 : (double)UnitMaxHeatEfficiency?.Value;
                        equipment.unit.maxOverallEfficiency = UnitMaxOverallEfficiency == null ? 0.0 : (double)UnitMaxOverallEfficiency?.Value;


                        // ( totalPowerCapacityKw / 1000 ) to make it MW
                        sumOfTotalPowerCapMultMaxHeatToPowerRatioMW += (decimal)(equipment.unit.totalPowerCapacityKw / 1000 * equipment.unit.maxHeatToPowerRatio);
                    }

                    submission.qualifyingHeatOutput = sumOfTotalPowerCapMultMaxHeatToPowerRatioMW;
                    resultSubmission["desnz_qualifyingheatoutputmwh"] = submission.qualifyingHeatOutput;
                }






                if (submission.totalFuelEnergyInputs != null && submission.totalFuelEnergyInputs != 0)
                {
                    if (submission.totalPowerGenerated != null)//&& submission.totalPowerGenerated != 0)
                    {
                        submission.powerEfficiency = 100 * ( submission.totalPowerGenerated / submission.totalFuelEnergyInputs );
                        resultSubmission["desnz_power"] = submission.powerEfficiency;

                        submission.achivePowerEfficiencyThreshold = submission.powerEfficiency >= submission.powerEfficiencyThreshold;
                        resultSubmission["desnz_didyourschemeachievethepowerefficiencythres"] = submission.achivePowerEfficiencyThreshold;
                        // need to update submission
                    }

                    if (submission.qualifyingHeatOutput != null)// && submission.qualifyingHeatOutput != 0)
                    {
                        submission.heatEfficiency = 100 * ( submission.qualifyingHeatOutput / submission.totalFuelEnergyInputs );
                        resultSubmission["desnz_heat"] = submission.heatEfficiency;
                        // need to update submission
                    }

                }
            }
            else if (submission.submissionFormType == (int)Submission.SubmissionFormType.F4)     // if complex form
            {
                if (submission.totalFuelEnergyInputs != null && submission.totalFuelEnergyInputs != 0 && submission.FOI != 0)
                {
                    if (submission.totalPowerGenerated != null)// && submission.totalPowerGenerated != 0)
                    {
                        submission.powerEfficiency = 100 * ( submission.totalPowerGenerated * submission.FOP) / (submission.totalFuelEnergyInputs * submission.FOI );
                        resultSubmission["desnz_power"] = submission.powerEfficiency;

                        submission.achivePowerEfficiencyThreshold = submission.powerEfficiency >= submission.powerEfficiencyThreshold;
                        resultSubmission["desnz_didyourschemeachievethepowerefficiencythres"] = submission.achivePowerEfficiencyThreshold;
                        // need to update submission
                    }
                    if (submission.qualifyingHeatOutput != null)// && submission.qualifyingHeatOutput != 0)
                    {
                        submission.heatEfficiency = 100 * ( submission.qualifyingHeatOutput * submission.FOH) / (submission.totalFuelEnergyInputs * submission.FOI );
                        resultSubmission["desnz_heat"] = submission.heatEfficiency;
                        // need to update submission
                    }
                }
            }

            // get energy inputs
            QueryExpression query = new QueryExpression
            {
                EntityName = "desnz_fuelinputs", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_fnxn", "desnz_fn_yn", "desnz_rocsfnxn", "desnz_rocsfnyn"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission),
                            new ConditionExpression("desnz_calculationused", ConditionOperator.Equal, true)
                        }
                }
            };

            EntityCollection resultsEnergyInputs = await service.RetrieveMultipleAsync(query);

            //if there are energy input entries
            if (resultsEnergyInputs != null)
            {
                submission.sumFnX = 0.0m;
                submission.sumFnY = 0.0m;

                submission.rocscfdSumFnX = 0.0m;
                submission.rocscfdsumFnY = 0.0m;

                // sum the FnX and FnY of all the energy inputs that are used in caclulations
                foreach (Entity entityEnergyInput in resultsEnergyInputs.Entities)
                {
                    EnergyInput energyInput = new EnergyInput();

                    energyInput.fnX = entityEnergyInput.GetAttributeValue<decimal?>("desnz_fnxn");
                    energyInput.fnY = entityEnergyInput.GetAttributeValue<decimal?>("desnz_fn_yn");

                    submission.sumFnX += energyInput.fnX;
                    submission.sumFnY += energyInput.fnY;

                    energyInput.rocscfdFnX = entityEnergyInput.GetAttributeValue<decimal?>("desnz_rocsfnxn");
                    energyInput.rocscfdFnY = entityEnergyInput.GetAttributeValue<decimal?>("desnz_rocsfnyn");

                    if (energyInput.rocscfdFnX != null && energyInput.rocscfdFnY != null)
                    {
                        submission.rocscfdSumFnX += energyInput.rocscfdFnX;
                        submission.rocscfdsumFnY += energyInput.rocscfdFnY;
                    }


                }
                resultSubmission["desnz_weightedfactorfnxx"] = submission.sumFnX;
                resultSubmission["desnz_weightedfactorfnxy"] = submission.sumFnY;

                resultSubmission["desnz_rocsweightedfactorfnxxsum"] = submission.rocscfdSumFnX;
                resultSubmission["desnz_rocsweightedfactorfnxysum"] = submission.rocscfdsumFnY;

                // calculate Quality Index
                if (submission.powerEfficiency != null && submission.heatEfficiency != null)
                {
                    // calculate Quality Index CHPQA

                    // for calculation efficiencies must be be expressed as decimal fractions, e.g. 40.25% = 0.4025 (so we need to divide with 100)
                    submission.qualityIndex = submission.sumFnX * submission.powerEfficiency / 100 + submission.sumFnY * submission.heatEfficiency / 100;
                    resultSubmission["desnz_qualityindex"] = submission.qualityIndex;

                    if (submission.qualityIndexThreshold != null)
                    {
                        submission.qualityIndexThresholdAchived = submission.qualityIndex >= submission.qualityIndexThreshold;
                        resultSubmission["desnz_didyourschemeachievetheqithreshold"] = submission.qualityIndexThresholdAchived;
                    }

                    // calculate Quality Index ROCS/CFD

                    // for calculation efficiencies must be be expressed as decimal fractions, e.g. 40.25% = 0.4025 (so we need to divide with 100)
                    submission.rocscfdQualityIndex = submission.rocscfdSumFnX * submission.powerEfficiency / 100 + submission.rocscfdsumFnY * submission.heatEfficiency / 100;
                    resultSubmission["desnz_rocsqualityindex"] = submission.rocscfdQualityIndex;

                    if (submission.qualityIndexThreshold != null)
                    {
                        submission.rocscfdQualityIndexThresholdAchived = submission.rocscfdQualityIndex >= submission.qualityIndexThreshold;
                        resultSubmission["desnz_rocscfdqithresholdachieved"] = submission.qualityIndexThresholdAchived;
                    }

                }


            }

            //update DB submission entry
            await service.UpdateAsync(resultSubmission);

        }
    }


}