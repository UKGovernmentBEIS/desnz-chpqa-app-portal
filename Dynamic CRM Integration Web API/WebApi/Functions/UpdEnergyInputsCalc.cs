using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;

namespace WebApi.Functions
{

    public static class UpdEnergyInputsCalc
    {
        public static async Task CalculateAsync(Guid? idSubmission, ServiceClient service)
        {
            decimal sumfnx = 0;
            decimal sumfny = 0;
            decimal totalFuelEnergyInputs = 0;

            QueryExpression relatedquery = new QueryExpression
            {
                EntityName = "desnz_fuelinputs", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_fuelinputsid", "desnz_calculationused", "desnz_fnxn", "desnz_fn_yn", "desnz_annualtotal"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                        }
                }
            };

            EntityCollection relatedfuelinputs = await service.RetrieveMultipleAsync(relatedquery);

            foreach (Entity fuelitem in relatedfuelinputs.Entities)
            {
                if (fuelitem.GetAttributeValue<bool?>("desnz_calculationused") == true)
                {
                    totalFuelEnergyInputs += fuelitem.GetAttributeValue<decimal>("desnz_annualtotal");
                }
            }

            foreach (Entity fuelitem in relatedfuelinputs.Entities)
            {

                if (fuelitem.GetAttributeValue<bool?>("desnz_calculationused") == true)
                {

                    sumfnx += fuelitem.GetAttributeValue<decimal>("desnz_fnxn");
                    sumfny += fuelitem.GetAttributeValue<decimal>("desnz_fn_yn");

                }
                else
                {
                    fuelitem["desnz_fnxn"] = 0;
                    fuelitem["desnz_fn_yn"] = 0;
                }
            }
            Entity resultSubmission = new Entity("desnz_submission", idSubmission ?? Guid.Empty);       // get submission

            resultSubmission["desnz_totalfuelandenergyinputsmwh"] = totalFuelEnergyInputs;
            resultSubmission["desnz_weightedfactorfnxx"] = sumfnx;
            resultSubmission["desnz_weightedfactorfnxy"] = sumfny;

            resultSubmission["desnz_estimatedtotalfuelandenergyinputsused"] = 0.0m;
            resultSubmission["desnz_estiamatedtotalfuelandenergyinputs"] = 0.0m;

            await service.UpdateAsync(resultSubmission);

        }
    }
}