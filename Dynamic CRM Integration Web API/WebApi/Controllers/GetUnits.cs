using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]

    public class GetUnits : ControllerBase
    {

        private readonly ILogger<GetUnits> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetUnits(ILogger<GetUnits> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Returns a list of all Units / Engines
        /// </summary>
        /// <response code="200">If the Unti list is returned successfully</response>
        /// <response code="400">If a bad request occures</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<Unit>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetAllUnits")]
        [SwaggerOperation(Summary = "Get all Units", Description = "Retrieves a list of all Units of a Model.")]
        public async Task<IActionResult> GetAllUnits()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<Unit> entities = new List<Unit>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_unit", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_name", "desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw", "desnz_fuelinputkw", "desnz_powerefficiency", "desnz_maxheattopowerratio", "desnz_maxheatefficiency", "desnz_maxoverallefficiency"),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_unit", // Parent entity
                                LinkFromAttributeName = "desnz_manufacturer", // Parent entity attribute
                                LinkToEntityName = "desnz_manufacturer", // Related entity
                                LinkToAttributeName = "desnz_manufacturerid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_manufacturerid", "desnz_name"),
                                EntityAlias = "Manufacturer", // Alias for the related entity
                      
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_unit", // Parent entity
                                LinkFromAttributeName = "desnz_model", // Parent entity attribute
                                LinkToEntityName = "desnz_modelnumber", // Related entity
                                LinkToAttributeName = "desnz_modelnumberid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_modelnumberid","desnz_name"),
                                EntityAlias = "Model", // Alias for the related entity
                      
                            }
                            ,new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_unit", // Parent entity
                                LinkFromAttributeName = "desnz_engine", // Parent entity attribute
                                LinkToEntityName = "desnz_engine", // Related entity
                                LinkToAttributeName = "desnz_engineid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_engineid","desnz_name"),
                                EntityAlias = "Engine", // Alias for the related entity
                        
                            }
                        },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("statecode", ConditionOperator.Equal, 0 )
                            }
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    Unit myEntity = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {

                        AliasedValue ManufacturerId = (AliasedValue)entity["Manufacturer.desnz_manufacturerid"];
                        AliasedValue ManufacturerName = (AliasedValue)entity["Manufacturer.desnz_name"];

                        AliasedValue ModelId = (AliasedValue)entity["Model.desnz_modelnumberid"];
                        AliasedValue ModelName = (AliasedValue)entity["Model.desnz_name"];

                        AliasedValue EngineId = (AliasedValue)entity["Engine.desnz_engineid"];
                        AliasedValue EngineName = (AliasedValue)entity["Engine.desnz_name"];

                        myEntity = new Unit();

                        myEntity.id = entity.GetAttributeValue<Guid>("desnz_unitid");
                        myEntity.name = entity.GetAttributeValue<string>("desnz_name");
                        myEntity.totalPowerCapacityKw = entity.GetAttributeValue<double>("desnz_totalpowercapacitykw");
                        myEntity.totalHeatCapacityKw = entity.GetAttributeValue<double>("desnz_totalheatcapacitykw");
                        myEntity.fuelInputKw = entity.GetAttributeValue<double>("desnz_fuelinputkw");
                        myEntity.powerEfficiency = entity.GetAttributeValue<double>("desnz_powerefficiency");
                        myEntity.maxHeatToPowerRatio = entity.GetAttributeValue<double>("desnz_maxheattopowerratio");
                        myEntity.maxHeatEfficiency = entity.GetAttributeValue<double>("desnz_maxheatefficiency");
                        myEntity.maxOverallEfficiency = entity.GetAttributeValue<double>("desnz_maxoverallefficiency");

                        myEntity.manufacturer = new Manufacturer();
                        myEntity.manufacturer.id = ManufacturerId == null ? Guid.Empty : (Guid)ManufacturerId.Value;
                        myEntity.manufacturer.name = ManufacturerName?.Value.ToString() ?? string.Empty;

                        myEntity.model = new Model.Model();
                        myEntity.model.id = ModelId == null ? Guid.Empty : (Guid)ModelId.Value;
                        myEntity.model.name = ModelName?.Value.ToString() ?? string.Empty;

                        myEntity.engine = new Engine();
                        myEntity.engine.id = EngineId == null ? Guid.Empty : (Guid)EngineId.Value;
                        myEntity.engine.name = EngineName?.Value.ToString() ?? string.Empty;

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

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }
    }
}
