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

    public class GetEquipmentTypesAndSubTypes : ControllerBase
    {

        private readonly ILogger<GetEquipmentTypesAndSubTypes> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetEquipmentTypesAndSubTypes(ILogger<GetEquipmentTypesAndSubTypes> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;

        }

        [HttpGet("GetEquipmentTypesAndSubTypes")]
        [SwaggerOperation(Summary = "Get Equipment Types and Sub Types", Description = "Retrieves a list of all Equipment Types and their Sub Types.")]
        public async Task<ActionResult<List<EquipmentType>>> GetAllEquipmentTypes()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<EquipmentType> entities = new List<EquipmentType>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_equipmenttype", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_equipmenttypeid", "desnz_name", "desnz_prefix"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                                {
                                    new ConditionExpression("statecode", ConditionOperator.Equal, 0 )
                                }
                        },
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_equipmenttype", // Parent entity
                                LinkFromAttributeName = "desnz_equipmenttypeid", // Parent entity attribute
                                LinkToEntityName = "desnz_equipmentsubtype", // Related entity
                                LinkToAttributeName = "desnz_equipmenttype", // Related entity attribute
                                Columns =  new ColumnSet("desnz_equipmentsubtypeid", "desnz_name", "desnz_suffix"),
                                EntityAlias = "EquipmentSubType", // Alias for the related entity                              
                                LinkCriteria = new FilterExpression
                                {
                                    Conditions =
                                        {
                                            new ConditionExpression("statecode", ConditionOperator.Equal, 0 )
                                        }
                                }
                            }
                        },
                        Orders =
                        {
                            new OrderExpression("desnz_equipmenttypeid", OrderType.Ascending) // Order by equipment type ID
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    EquipmentType equipmentType = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {

                        if(equipmentType == null || equipmentType.id != entity.GetAttributeValue<Guid>("desnz_equipmenttypeid"))
                        {
                            equipmentType = new EquipmentType();

                            equipmentType.id = entity.GetAttributeValue<Guid>("desnz_equipmenttypeid");
                            equipmentType.name = entity.GetAttributeValue<string>("desnz_name");
                            equipmentType.prefix = entity.GetAttributeValue<string>("desnz_prefix");

                            equipmentType.equipmentSubTypeList = new List<EquipmentSubType>();

                            entities.Add(equipmentType);

                        }
                        
                        if (entity.Attributes.ContainsKey("EquipmentSubType.desnz_equipmentsubtypeid") && entity["EquipmentSubType.desnz_equipmentsubtypeid"] is AliasedValue AliasedValue)
                        {
                            EquipmentSubType equipmentSubType = null;

                            AliasedValue EquipmentSubTypeId = (AliasedValue)entity["EquipmentSubType.desnz_equipmentsubtypeid"];
                            AliasedValue EquipmentSubTypeName = (AliasedValue)entity["EquipmentSubType.desnz_name"];
                            AliasedValue EquipmentSubTypeSuffix = (AliasedValue)entity["EquipmentSubType.desnz_suffix"];

                            equipmentSubType = new EquipmentSubType();
                            equipmentSubType.id = EquipmentSubTypeId == null ? Guid.Empty : (Guid)EquipmentSubTypeId.Value;
                            equipmentSubType.name = EquipmentSubTypeName?.Value.ToString() ?? string.Empty;
                            equipmentSubType.suffix = EquipmentSubTypeSuffix?.Value.ToString() ?? string.Empty;

                            equipmentType.equipmentSubTypeList.Add(equipmentSubType);
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

                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error Occurred");

            }
        }
    }
}