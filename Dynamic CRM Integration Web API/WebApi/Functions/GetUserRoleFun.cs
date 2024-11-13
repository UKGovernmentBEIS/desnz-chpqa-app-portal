using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk;
using System.Security.Claims;
using Microsoft.PowerPlatform.Dataverse.Client;

namespace WebApi.Functions
{
    public static class GetUserRoleFun
    {

        public static async Task<int> GetRoleOfUser(ClaimsPrincipal User, ServiceClient service)
        {

            var email = User.Claims.First(x => x.Type == "preferred_username").Value;

            QueryExpression query = new QueryExpression
            {
                EntityName = "contact", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("contactid", "desnz_usertype"),
                Criteria = new FilterExpression
                {
                    Conditions =
                        {
                            new ConditionExpression("emailaddress1", ConditionOperator.Equal, email)
                        }
                }
            };

            EntityCollection results = await service.RetrieveMultipleAsync(query);

            if (results.Entities.Count > 0)
            {
                if (results.Entities[0].Attributes.ContainsKey("desnz_usertype") && results.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                {
                    return optionSetValue.Value;
                }
            }

            return 0;

        }
    }
}
