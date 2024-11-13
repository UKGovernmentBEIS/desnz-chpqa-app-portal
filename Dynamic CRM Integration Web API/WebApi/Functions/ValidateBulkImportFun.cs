using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using static WebApi.Controllers.GetFuelCategoriesAndFuels;
using WebApi.Contracts;
using WebApi.Model;

namespace WebApi.Functions
{
    public class ValidateBulkImportFun
    {
        public static async Task<bool> ValidateFuelTypeFuelCategory(string fuelTypeName, string fuelCategoryName, ServiceClient service, ILogger logger)
        {

            QueryExpression queryFuel = new QueryExpression
            {
                EntityName = "desnz_fuel",
                ColumnSet = new ColumnSet("desnz_fuelid", "desnz_name", "desnz_category"),
                LinkEntities =
                {
                    new LinkEntity
                    {
                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                        LinkFromEntityName = "desnz_fuel", // Parent entity
                        LinkFromAttributeName = "desnz_category", // Parent entity attribute
                        LinkToEntityName = "desnz_fuelcategory", // Related entity
                        LinkToAttributeName = "desnz_fuelcategoryid", // Related entity attribute
                        Columns =  new ColumnSet("desnz_fuelcategoryid", "desnz_name", "desnz_category", "desnz_tooltip", "desnz_rocs", "desnz_renewable"),
                        EntityAlias = "FuelCategory", // Alias for the related entity
                      
                    }
                },
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("desnz_name", ConditionOperator.Equal, fuelTypeName)
                    }
                }
            };

            EntityCollection fuelRsults = await service.RetrieveMultipleAsync(queryFuel);

            // if cannot find the fuel
            if(fuelRsults.Entities.Count == 0)
            {
                return false;
            }

            Fuel fuelType = new Fuel();

            fuelType.id = fuelRsults.Entities[0].GetAttributeValue<Guid>("desnz_fuelid");
            fuelType.name = fuelRsults.Entities[0].GetAttributeValue<string>("desnz_name");
            fuelType.fuelCategory = new FuelCategory();

            if (fuelRsults.Entities[0].Attributes.ContainsKey("FuelCategory.desnz_fuelcategoryid") && fuelRsults.Entities[0]["FuelCategory.desnz_fuelcategoryid"] is AliasedValue AliasedValue)
            {
                AliasedValue FuelCategoryId = (AliasedValue)fuelRsults.Entities[0]["FuelCategory.desnz_fuelcategoryid"];
                AliasedValue FuelCategoryName = (AliasedValue)fuelRsults.Entities[0]["FuelCategory.desnz_name"];

                fuelType.fuelCategory.id = FuelCategoryId == null ? null : (Guid)FuelCategoryId.Value;
                fuelType.fuelCategory.name = FuelCategoryName?.Value.ToString() ?? string.Empty;
            }

            if(fuelType.fuelCategory.name != fuelCategoryName)
            {
                return false;
            }

            return true;
        }





    }
}
