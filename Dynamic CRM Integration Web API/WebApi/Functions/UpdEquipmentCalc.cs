using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace WebApi.Functions
{
    public static class UpdEquipmentCalc
    {
        public static async Task CalculateAsync(Guid? idSubmission, ServiceClient service)
        {
            //Calculations of equipment list vars
            double chptotalpowercapacity = 0.0;
            double chptotalheatcapacity = 0.0;
            double chpmaxheat = 0.0;

            QueryExpression relatedquery = new QueryExpression
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
                                Columns =  new ColumnSet("desnz_unitid", "desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw"  ),
                                EntityAlias = "Unit"
                            }
                        },
                Criteria = new FilterExpression
                {
                    Conditions =
                            {
                        new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                            }
                }
            };

            EntityCollection relatedModelresults = await service.RetrieveMultipleAsync(relatedquery);


            List<string> equipmentsIds = new List<string>(); // List to store equipment IDs

            foreach (Entity entity in relatedModelresults.Entities)
            {
                AliasedValue UnitTotalPowerCapacityKw = (AliasedValue)entity["Unit.desnz_totalpowercapacitykw"];
                AliasedValue UnitTotalHeatCapacityKw = (AliasedValue)entity["Unit.desnz_totalheatcapacitykw"];

                // calculations for given unit
                chptotalpowercapacity += UnitTotalPowerCapacityKw == null ? 0.0 : (double)UnitTotalPowerCapacityKw.Value;
                chptotalheatcapacity += UnitTotalHeatCapacityKw == null ? 0.0 : (double)UnitTotalHeatCapacityKw?.Value;
                chpmaxheat += UnitTotalHeatCapacityKw == null ? 0.0 : (double)UnitTotalHeatCapacityKw?.Value;

            }
            Entity resultSubmission = new Entity("desnz_submission", idSubmission ?? Guid.Empty);       // get submission

            resultSubmission["desnz_chptotalpowercapacity"] = chptotalpowercapacity;
            resultSubmission["desnz_chptotalheatcapacity"] = chptotalheatcapacity;
            resultSubmission["desnz_chpmaxheat"] = chpmaxheat;

            await service.UpdateAsync(resultSubmission);

        }
    }
}