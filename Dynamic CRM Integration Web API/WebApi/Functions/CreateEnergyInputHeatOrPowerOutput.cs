using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Diagnostics.Metrics;
using WebApi.Contracts;
using WebApi.Model;
using Meter = WebApi.Model.Meter;

namespace WebApi.Functions
{
    public class CreateEnergyInputHeatOrPowerOutput
    {

        public static async Task CreateFun(RequestMeter meterData, Entity meter, int energyPowerHeatGroup, Guid idSubmission, ServiceClient service, ILogger logger)
        {

            if (Enum.IsDefined(typeof(Meter.MeasureType), (int)meterData.measureType))
            {
                if (meterData.measureType == (int)Meter.MeasureType.EnergyInput)    //Energy Input
                {
                    Entity ΕnergyInputs = new("desnz_fuelinputs");

                    ΕnergyInputs["desnz_name"] = "M" + meterData.tagNumber.ToString();
                    ΕnergyInputs["desnz_tagnum"] = meterData.tagNumber;
                    ΕnergyInputs["desnz_tagprefix"] = "Μ";
                    ΕnergyInputs["desnz_serialnumber"] = meterData.serialNumber;
                    ΕnergyInputs["desnz_year1"] = meterData.yearInstalled;
                    ΕnergyInputs["desnz_calculationused"] = null;
                    ΕnergyInputs["desnz_submission"] = new EntityReference("desnz_submission", idSubmission);
                    ΕnergyInputs["desnz_meter"] = new EntityReference("desnz_fuelmeters", meter.Id);

                    ΕnergyInputs.Id = service.Create(ΕnergyInputs);

                    energyPowerHeatGroup = (int)SubmissionGroups.GroupType.ProvideEnergyInputs;

                    logger.LogInformation("Created new Energy Input at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), ΕnergyInputs.Id.ToString());

                }
                else if (meterData.measureType == (int)Meter.MeasureType.PowerOutput)   //Power Output
                {
                    Entity PowerOutput = new("desnz_poweroutputs");

                    PowerOutput["desnz_name"] = "M" + meterData.tagNumber.ToString();
                    PowerOutput["desnz_tagnum"] = meterData.tagNumber;
                    PowerOutput["desnz_tagprefix"] = "Μ";
                    PowerOutput["desnz_serialnumber"] = meterData.serialNumber;
                    PowerOutput["desnz_year"] = meterData.yearInstalled;
                    PowerOutput["desnz_arethereanychpqacalculations"] = null;
                    PowerOutput["desnz_submission"] = new EntityReference("desnz_submission", idSubmission);
                    PowerOutput["desnz_meter"] = new EntityReference("desnz_fuelmeters", meter.Id);
                    if (meterData.equipmentSubTypeId != null)
                    {
                        // equipment sub type - meter type relationship
                        PowerOutput["desnz_metertype"] = new EntityReference("desnz_equipmentsubtype", meterData.equipmentSubTypeId ?? Guid.Empty);
                    }

                    PowerOutput.Id = service.Create(PowerOutput);

                    energyPowerHeatGroup = (int)SubmissionGroups.GroupType.ProvidePowerOutputs;

                    logger.LogInformation("Created new Power Output at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), PowerOutput.Id.ToString());

                }
                else if (meterData.measureType == (int)Meter.MeasureType.HeatOutput)   //Heat Output
                {
                    Entity HeatOutput = new("desnz_heatoutput");

                    HeatOutput["desnz_name"] = "M" + meterData.tagNumber.ToString();
                    HeatOutput["desnz_tagnum"] = meterData.tagNumber;
                    HeatOutput["desnz_tagprefix"] = "Μ";
                    HeatOutput["desnz_serialnumber"] = meterData.serialNumber;
                    HeatOutput["desnz_year"] = meterData.yearInstalled;
                    HeatOutput["desnz_arethereanychpqacalculations"] = null;
                    HeatOutput["desnz_submission"] = new EntityReference("desnz_submission", idSubmission);
                    HeatOutput["desnz_meter"] = new EntityReference("desnz_fuelmeters", meter.Id);
                    if (meterData.equipmentSubTypeId != null)
                    {
                        // equipment sub type - meter type relationship
                        HeatOutput["desnz_metertype"] = new EntityReference("desnz_equipmentsubtype", meterData.equipmentSubTypeId ?? Guid.Empty);
                    }

                    HeatOutput.Id = service.Create(HeatOutput);

                    energyPowerHeatGroup = (int)SubmissionGroups.GroupType.ProvideHeatOutputs;

                    logger.LogInformation("Created new Heat Output at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), HeatOutput.Id.ToString());

                }

                // for energy input, power or heat output
                // update submission group status and check to unlock next goups
                await UpdSectionStatusesFun.ChangeSectionStatuses(idSubmission, energyPowerHeatGroup, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, service, logger);

            }

        }

    }
}
