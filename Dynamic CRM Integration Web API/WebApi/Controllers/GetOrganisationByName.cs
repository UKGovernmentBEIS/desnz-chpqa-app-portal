using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class GetOrganisationByName : ControllerBase
    {
        private readonly ILogger<GetOrganisationByName> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetOrganisationByName(ILogger<GetOrganisationByName> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpGet("GetOrganisationsByName")]
        [SwaggerOperation(Summary = "Get Organisations by Name", Description = "Retrieves a Organisations with the given Name.")]
        public async Task<ActionResult<Organisation>> OrganisationsByName(string name)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<Organisation> entities = new List<Organisation>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "account", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("name", "desnz_registrationnumber", "address1_name", "address2_name", "address1_city", "address1_county", "address1_postalcode"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("name", ConditionOperator.Like, name)
                            }
                        }
                    };
               
                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    Organisation myEntity = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {
                        myEntity = new Organisation();

                        myEntity.id = entity.GetAttributeValue<Guid>("accountid");
                        myEntity.name = entity.GetAttributeValue<string>("name");
                        myEntity.registrationNumber = entity.GetAttributeValue<string>("desnz_registrationnumber");
                        myEntity.address1 = entity.GetAttributeValue<string>("address1_name");
                        myEntity.address2 = entity.GetAttributeValue<string>("address2_name");
                        myEntity.town = entity.GetAttributeValue<string>("address1_city");
                        myEntity.county = entity.GetAttributeValue<string>("address1_county");
                        myEntity.postcode = entity.GetAttributeValue<string>("address1_postalcode");

                        entities.Add(myEntity);
                    }      
                    
                    return Ok(entities);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error Occurred");
            }
        }
    }
}
