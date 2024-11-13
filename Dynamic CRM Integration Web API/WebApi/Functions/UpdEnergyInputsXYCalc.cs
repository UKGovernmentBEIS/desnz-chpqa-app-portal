using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Rest;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using WebApi.Model;

namespace WebApi.Functions
{
    public static class UpdEnergyInputsXYCalc
    {
        public static async Task CalculateAsync(Guid? idSubmission, ServiceClient service)
        {
            decimal sumfnx = 0;
            decimal sumfny = 0;
            decimal totalFuelEnergyInputs = 0;

            QueryExpression submissionquery = new QueryExpression
            {
                EntityName = "desnz_submission",
                ColumnSet = new ColumnSet("desnz_scheme", "desnz_chptotalpowercapacity"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submissionid", ConditionOperator.Equal,idSubmission)
                        }
                }
            };

            EntityCollection submissionresults = await service.RetrieveMultipleAsync(submissionquery);

            decimal chptotalpowercapacity = (decimal)submissionresults.Entities.FirstOrDefault().GetAttributeValue<double>("desnz_chptotalpowercapacity");


            EntityReference schemeEntityRef = null;

            if (submissionresults.Entities[0].Attributes.Contains("desnz_scheme") && submissionresults.Entities[0]["desnz_scheme"] != null)
            {
                schemeEntityRef = submissionresults.Entities[0]["desnz_scheme"] as EntityReference;
            }

            string schemeName = schemeEntityRef?.Name ?? string.Empty;

            Guid schemeId = schemeEntityRef == null ? Guid.Empty : schemeEntityRef.Id;

            QueryExpression policyquery = new QueryExpression
            {
                EntityName = "desnz_scheme",
                ColumnSet = new ColumnSet("desnz_policychpqa"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_schemeid", ConditionOperator.Equal, schemeId)
                        }
                }

            };

            EntityCollection schemepolicyresults = await service.RetrieveMultipleAsync(policyquery);

            EntityReference schemepolicy = null;

            if (schemepolicyresults.Entities[0].Attributes.Contains("desnz_policychpqa") && schemepolicyresults.Entities[0]["desnz_policychpqa"] != null)
            {
                schemepolicy = schemepolicyresults.Entities[0]["desnz_policychpqa"] as EntityReference;
            }

            string policyName = schemepolicy?.Name ?? string.Empty;

            Guid policyId = schemepolicy == null ? Guid.Empty : schemepolicy.Id;

            QueryExpression query = new QueryExpression
            {
                EntityName = "desnz_fuelcategory",
                ColumnSet = new ColumnSet("desnz_fuelcategoryid", "desnz_name")
            };

            EntityCollection fuelcategoryresults = await service.RetrieveMultipleAsync(query);

            query = new QueryExpression
            {
                EntityName = "desnz_fuel",
                ColumnSet = new ColumnSet("desnz_fuelid", "desnz_name")
            };
            EntityCollection fuelresults = await service.RetrieveMultipleAsync(query);


            QueryExpression relatedquery = new QueryExpression
            {
                EntityName = "desnz_fuelinputs",
                ColumnSet = new ColumnSet("desnz_fuelinputsid", "desnz_meter", "desnz_fuelcategory", "desnz_annualtotal", "desnz_calculationused"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                        }
                }
            };

            EntityCollection relatedModelresults = await service.RetrieveMultipleAsync(relatedquery);

            foreach (Entity fuelitem in relatedModelresults.Entities)
            {
                if (fuelitem.GetAttributeValue<bool?>("desnz_calculationused") == true)
                {
                    totalFuelEnergyInputs += fuelitem.GetAttributeValue<decimal>("desnz_annualtotal");
                }
                // if we find a energy input with no data do not proceed
                if (fuelitem.GetAttributeValue<decimal?>("desnz_annualtotal") == null || fuelitem.GetAttributeValue<decimal>("desnz_annualtotal") == 0)
                {
                    return;
                }
            }

            foreach (Entity entity in relatedModelresults.Entities)
            {
                decimal fractionTFI = 0;
                query = new QueryExpression
                {
                    EntityName = "desnz_fuelcategoryxy",
                    ColumnSet = new ColumnSet("desnz_x", "desnz_y"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                            {
                                new ConditionExpression("desnz_category", ConditionOperator.Equal,entity.GetAttributeValue<EntityReference>("desnz_fuelcategory").Id),
                                new ConditionExpression("desnz_policy", ConditionOperator.Equal, policyId),
                                new ConditionExpression("desnz_beginrangemwe", ConditionOperator.LessEqual, chptotalpowercapacity/1000),
                                new ConditionExpression("desnz_endrangemwe", ConditionOperator.GreaterEqual, chptotalpowercapacity/1000)
                            }
                    }
                };

                EntityCollection fuelcategoryresultsxy = service.RetrieveMultiple(query);

                if (entity.GetAttributeValue<bool?>("desnz_calculationused") == true)
                {
                    fractionTFI = entity.GetAttributeValue<decimal>("desnz_annualtotal") / totalFuelEnergyInputs;
                    entity["desnz_fnxn"] = fractionTFI * fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                    entity["desnz_fn_yn"] = fractionTFI * fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");

                }

                entity["desnz_fractionoftotalfuelinput"] = fractionTFI * 100;

                entity["desnz_xvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_x");
                entity["desnz_yvalue"] = (decimal)fuelcategoryresultsxy.Entities.FirstOrDefault().GetAttributeValue<int>("desnz_y");


                await service.UpdateAsync(entity);
            }
        }
    }
}