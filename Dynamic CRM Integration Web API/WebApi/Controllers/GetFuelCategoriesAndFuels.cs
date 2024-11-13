using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Model;
using WebApi.Contracts;
using WebApi.Services;


namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]

    public class GetFuelCategoriesAndFuels : ControllerBase
    {

        private readonly ILogger<GetFuelCategoriesAndFuels> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetFuelCategoriesAndFuels(ILogger<GetFuelCategoriesAndFuels> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;

        }

        /// <summary>
        /// Retrieves a list of all Equipment Types and their Sub Types.
        /// </summary>
        /// <response code="200">If the file was validated successfully</response>
        /// <response code="400">If a bad request occurs</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<ReplyFuelCategory>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetFuelCategoriesAndFuels")]
        [SwaggerOperation(Summary = "Get Equipment Types and Sub Types", Description = "Retrieves a list of all Equipment Types and their Sub Types.")]
        public async Task<IActionResult> GetAllFuelCategories()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<ReplyFuelCategory> entities = new List<ReplyFuelCategory>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_fuelcategory", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_fuelcategoryid", "desnz_name", "desnz_category", "desnz_tooltip", "desnz_rocs", "desnz_renewable"),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_fuelcategory", // Parent entity
                                LinkFromAttributeName = "desnz_fuelcategoryid", // Parent entity attribute
                                LinkToEntityName = "desnz_fuel", // Related entity
                                LinkToAttributeName = "desnz_category", // Related entity attribute
                                Columns =  new ColumnSet("desnz_fuelid", "desnz_name"),
                                EntityAlias = "Fuel", // Alias for the related entity
                      
                            }
                        },
                        Orders =
                        {
                            new OrderExpression("desnz_fuelcategoryid", OrderType.Ascending) // Order by fuel category ID
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    ReplyFuelCategory fuelCategory = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {

                        if (fuelCategory == null || fuelCategory.id != entity.GetAttributeValue<Guid>("desnz_fuelcategoryid"))
                        {
                            fuelCategory = new ReplyFuelCategory();

                            fuelCategory.id = entity.GetAttributeValue<Guid>("desnz_fuelcategoryid");
                            fuelCategory.name = entity.GetAttributeValue<string>("desnz_name");
                            fuelCategory.category = entity.GetAttributeValue<string>("desnz_category");
                            fuelCategory.tooltip = entity.GetAttributeValue<string>("desnz_tooltip");
                            fuelCategory.ROCS = entity.GetAttributeValue<bool?>("desnz_rocs");
                            fuelCategory.renewable = entity.GetAttributeValue<bool?>("desnz_renewable");

                            fuelCategory.FuelList = new List<ReplyFuel>();

                            entities.Add(fuelCategory);

                        }

                        if (entity.Attributes.ContainsKey("Fuel.desnz_fuelid") && entity["Fuel.desnz_fuelid"] is AliasedValue AliasedValue)
                        {
                            ReplyFuel fuel = null;

                            AliasedValue FuelId = (AliasedValue)entity["Fuel.desnz_fuelid"];
                            AliasedValue FuelName = (AliasedValue)entity["Fuel.desnz_name"];

                            fuel = new ReplyFuel();
                            fuel.id = FuelId == null ? Guid.Empty : (Guid)FuelId.Value;
                            fuel.name = FuelName?.Value.ToString() ?? string.Empty;

                            fuelCategory.FuelList.Add(fuel);
                        }

                    }

                    return Ok(entities);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

        public class ReplyFuelCategory                      // desnz_fuelcategory
        {
            public Guid? id { get; set; }                   // desnz_fuelcategoryid
            public string? name { get; set; }               // desnz_name
            public string? category { get; set; }           // desnz_category
            public string? tooltip { get; set; }            // desnz_tooltip
            public bool? ROCS { get; set; }                 // desnz_rocs
            public bool? renewable { get; set; }            // desnz_renewable
            public List<ReplyFuel>? FuelList { get; set; }
        }

    }
}