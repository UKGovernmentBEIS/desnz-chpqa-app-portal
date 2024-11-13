using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;

namespace WebApi.Functions
{
    public static class UpdHeatOutputsCalc
    {
        public static async Task CalculateAsync(Guid? idSubmission, ServiceClient service)
        {
            decimal qualifyingheatoutputmwh = 0;
            decimal totalheatexported = 0;

            QueryExpression relatedquery = new QueryExpression
            {
                EntityName = "desnz_heatoutput",
                ColumnSet = new ColumnSet("desnz_heatoutputid", "desnz_meter", "desnz_annualtotal", "desnz_arethereanychpqacalculations", "desnz_type"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                        }
                }
            };

            EntityCollection relatedPowerModelresults = await service.RetrieveMultipleAsync(relatedquery);

            foreach (Entity entity in relatedPowerModelresults.Entities)
            {

                if (entity.GetAttributeValue<bool?>("desnz_arethereanychpqacalculations") == true)
                {
                    if (entity.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)HeatOutput.HeatType.SuppliedToSite)
                    {
                        qualifyingheatoutputmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                    }
                    else if (entity.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)HeatOutput.HeatType.Exported)
                    {
                        qualifyingheatoutputmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                        totalheatexported += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                    }
                }
            }

            Entity resultSubmission = new Entity("desnz_submission", idSubmission ?? Guid.Empty);       // get submission

            resultSubmission["desnz_qualifyingheatoutputmwh"] = qualifyingheatoutputmwh;
            resultSubmission["desnz_totalheatexported"] = totalheatexported;

            resultSubmission["desnz_estimatedqualifyheatoutputfromprimemover"] = 0.0m;
            resultSubmission["desnz_estimatedqualifiedheatoutputfromtheboilers"] = 0.0m;

            await service.UpdateAsync(resultSubmission);


        }
    }
}