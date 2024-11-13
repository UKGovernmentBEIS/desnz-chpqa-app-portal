using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Model;

namespace WebApi.Functions
{
    public static class UpdPowerOutputsCalc
    {
        public static async Task CalculateAsync(Guid? idSubmission, ServiceClient service)
        {
            decimal totalpowergeneratedmwh = 0;
            decimal totalpowerexportedmwh = 0;
            decimal totalpowerimportedbysitethroughmwh = 0;

            QueryExpression relatedquery = new QueryExpression
            {
                EntityName = "desnz_poweroutputs", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("desnz_poweroutputsid", "desnz_meter", "desnz_annualtotal", "desnz_arethereanychpqacalculations", "desnz_type"),
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

                    if (entity.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)PowerOutput.PowerType.Generated)
                    {
                        totalpowergeneratedmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                    }
                    else if (entity.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)PowerOutput.PowerType.Exported)
                    {
                        totalpowerexportedmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                        totalpowergeneratedmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                    }
                    else if (entity.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)PowerOutput.PowerType.Imported)
                    {
                        totalpowerimportedbysitethroughmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                        totalpowergeneratedmwh += entity.GetAttributeValue<decimal>("desnz_annualtotal");
                    }
                }
            }

            Entity resultSubmission = new Entity("desnz_submission", idSubmission ?? Guid.Empty);       // get submission

            resultSubmission["desnz_totalpowergeneratedmwh"] = totalpowergeneratedmwh;
            resultSubmission["desnz_totalpowerexportedmwh"] = totalpowerexportedmwh;
            resultSubmission["desnz_totalpowerimportedbysitethroughmwh"] = totalpowerimportedbysitethroughmwh;

            await service.UpdateAsync(resultSubmission);

        }
    }
}