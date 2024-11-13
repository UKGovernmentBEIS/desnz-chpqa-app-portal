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

    public class GetEconSectAndSubSect : ControllerBase
    {

        private readonly ILogger<GetEconSectAndSubSect> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetEconSectAndSubSect(ILogger<GetEconSectAndSubSect> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;

        }

        [HttpGet("GetEconSectAndSubSect")]
        [SwaggerOperation(Summary = "Get Economic Sectors and Sub Sectors", Description = "Retrieves a list of all  Economic Sectors and their Sub Sectors.")]
        public async Task<ActionResult<List<EconomicSector>>> GetAllEquipmentTypes()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<EconomicSector> entities = new List<EconomicSector>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_sector", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_sectorid", "desnz_name" ),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_sector", // Parent entity
                                LinkFromAttributeName = "desnz_sectorid", // Parent entity attribute
                                LinkToEntityName = "desnz_subsector", // Related entity
                                LinkToAttributeName = "desnz_sector", // Related entity attribute
                                Columns =  new ColumnSet("desnz_subsectorid", "desnz_name", "desnz_sector"),
                                EntityAlias = "EconSubSector", // Alias for the related entity
                      
                            }
                        },
                        Orders =
                        {
                            new OrderExpression("desnz_sectorid", OrderType.Ascending) // Order by economic sector ID
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    EconomicSector economicSector = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {

                        if (economicSector == null || economicSector.id != entity.GetAttributeValue<Guid>("desnz_sectorid"))
                        {
                            economicSector = new EconomicSector();

                            economicSector.id = entity.GetAttributeValue<Guid>("desnz_sectorid");
                            economicSector.name = entity.GetAttributeValue<string>("desnz_name");

                            economicSector.economicSubSectorList = new List<EconomicSubSector>();

                            entities.Add(economicSector);

                        }

                        if (entity.Attributes.ContainsKey("EconSubSector.desnz_subsectorid") && entity["EconSubSector.desnz_subsectorid"] is AliasedValue AliasedValue)
                        {
                            EconomicSubSector economicSubSector = null;

                            AliasedValue EconomicSubSectorId = (AliasedValue)entity["EconSubSector.desnz_subsectorid"];
                            AliasedValue EconomicSubSectorName = (AliasedValue)entity["EconSubSector.desnz_name"];

                            economicSubSector = new EconomicSubSector();
                            economicSubSector.id = EconomicSubSectorId == null ? Guid.Empty : (Guid)EconomicSubSectorId.Value;
                            economicSubSector.name = EconomicSubSectorName?.Value.ToString() ?? string.Empty;

                            economicSector.economicSubSectorList.Add(economicSubSector);
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
    }
}