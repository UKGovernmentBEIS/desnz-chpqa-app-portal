using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]

    public class GetEquipmentListBySubmissionId : ControllerBase
    {
        private readonly ILogger<GetEquipmentListBySubmissionId> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetEquipmentListBySubmissionId(ILogger<GetEquipmentListBySubmissionId> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves Details of Equipment List By Submission Id.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of Equipments with their details by the given id of a Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetEquipmentListBySubmissionId")]
        [SwaggerOperation(Summary = "Get Equipment List By Submission Id", Description = "Retrieves Details of Equipment List By Submission Id.")]
        [ProducesResponseType(typeof(List<ReplyEquipment>), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        public async Task<ActionResult<List<ReplyEquipment>>> EquipmentListBySubmissionId(Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
  
                    List<ReplyEquipment> entities = new List<ReplyEquipment>();

                    // EQUIPMENTS

                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_primemovers", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_primemoversid", "desnz_name", "desnz_tagnum", "desnz_yearcommissioned", "desnz_mechanicalload",
                            "desnz_comments", "desnz_equipmenttype", "desnz_equipmentsubtype", "desnz_unit"),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_primemovers", // Parent entity
                                LinkFromAttributeName = "desnz_unit", // Parent entity attribute
                                LinkToEntityName = "desnz_unit", // Related entity
                                LinkToAttributeName = "desnz_unitid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_unitid", "desnz_name", "desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw",
                                    "desnz_fuelinputkw", "desnz_powerefficiency", "desnz_maxheattopowerratio", "desnz_maxheatefficiency",
                                    "desnz_maxoverallefficiency", "desnz_engine", "desnz_model", "desnz_manufacturer"),
                                EntityAlias = "Unit"
                            }
                        },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                            }
                        }
                    };

                    EntityCollection relatedModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);


                    List<string> equipmentsIds = new List<string>(); // List to store equipment IDs

                    foreach (Entity entity in relatedModelresults.Entities)
                    {
                        ReplyEquipment equipment = new ReplyEquipment();

                        equipment.id = entity.GetAttributeValue<Guid>("desnz_primemoversid");
                        equipmentsIds.Add(equipment.id.ToString());
                        equipment.name = entity.GetAttributeValue<string>("desnz_name");
                        equipment.tagNumber = entity.GetAttributeValue<string>("desnz_tagnum");
                        equipment.yearCommissioned = entity.GetAttributeValue<int>("desnz_yearcommissioned");
                        equipment.mechanicalLoad = entity.GetAttributeValue<bool?>("desnz_mechanicalload");
                        equipment.comments = entity.GetAttributeValue<string>("desnz_comments");

                        // Get equipment type details
                        EntityReference equipTypeEntityRef = null;
                        if (entity.Attributes.Contains("desnz_equipmenttype") && entity["desnz_equipmenttype"] != null)
                        {
                            equipTypeEntityRef = entity["desnz_equipmenttype"] as EntityReference;
                        }

                        equipment.equipmentType = new ReplyEquipmentType();
                        equipment.equipmentType.id = equipTypeEntityRef == null ? null : equipTypeEntityRef.Id;
                        equipment.equipmentType.name = equipTypeEntityRef?.Name ?? null;

                        // Get equipment type details
                        EntityReference equipSubTypeEntityRef = null;
                        if (entity.Attributes.Contains("desnz_equipmentsubtype") && entity["desnz_equipmentsubtype"] != null)
                        {
                            equipSubTypeEntityRef = entity["desnz_equipmentsubtype"] as EntityReference;
                        }

                        equipment.equipmentSubType = new ReplyEquipmentSubType();
                        equipment.equipmentSubType.id = equipSubTypeEntityRef == null ? null : equipSubTypeEntityRef.Id; ;
                        equipment.equipmentSubType.name = equipSubTypeEntityRef?.Name ?? null;

                        AliasedValue UnitId = (AliasedValue)entity["Unit.desnz_unitid"];
                        AliasedValue UnitName = (AliasedValue)entity["Unit.desnz_name"];

                        AliasedValue UnitTotalPowerCapacityKw = null;
                        AliasedValue UnitTotalHeatCapacityKw = null;
                        AliasedValue UnitFuelInputKw = null;
                        AliasedValue UnitPowerEfficiency = null;
                        AliasedValue UnitMaxHeatToPowerRatio = null;
                        AliasedValue UnitMaxHeatEfficiency = null;
                        AliasedValue UnitMaxOverallEfficiency = null;

                        if (entity.Attributes.Contains("Unit.desnz_totalpowercapacitykw") && entity["Unit.desnz_totalpowercapacitykw"] != null)
                        {
                             UnitTotalPowerCapacityKw = (AliasedValue)entity["Unit.desnz_totalpowercapacitykw"];
                        }
                        if (entity.Attributes.Contains("Unit.desnz_totalheatcapacitykw") && entity["Unit.desnz_totalheatcapacitykw"] != null)
                        {
                             UnitTotalHeatCapacityKw = (AliasedValue)entity["Unit.desnz_totalheatcapacitykw"];
                        }
                        if (entity.Attributes.Contains("Unit.desnz_fuelinputkw") && entity["Unit.desnz_fuelinputkw"] != null)
                        {
                            UnitFuelInputKw = (AliasedValue)entity["Unit.desnz_fuelinputkw"];
                        }
                        if (entity.Attributes.Contains("Unit.desnz_powerefficiency") && entity["Unit.desnz_powerefficiency"] != null)
                        {
                            UnitPowerEfficiency = (AliasedValue)entity["Unit.desnz_powerefficiency"];
                        }
                        if (entity.Attributes.Contains("Unit.desnz_maxheattopowerratio") && entity["Unit.desnz_maxheattopowerratio"] != null)
                        {
                            UnitMaxHeatToPowerRatio = (AliasedValue)entity["Unit.desnz_maxheattopowerratio"];
                        }
                        if (entity.Attributes.Contains("Unit.desnz_maxheatefficiency") && entity["Unit.desnz_maxheatefficiency"] != null)
                        {
                            UnitMaxHeatEfficiency = (AliasedValue)entity["Unit.desnz_maxheatefficiency"];
                        }
                        if (entity.Attributes.Contains("Unit.desnz_maxoverallefficiency") && entity["Unit.desnz_maxoverallefficiency"] != null)
                        {
                            UnitMaxOverallEfficiency = (AliasedValue)entity["Unit.desnz_maxoverallefficiency"];
                        }

                        equipment.unit = new ReplyUnit();
                        equipment.unit.id = UnitId == null ? Guid.Empty : (Guid)UnitId.Value;
                        equipment.unit.totalPowerCapacityKw = UnitTotalPowerCapacityKw == null ? 0.0 : (double)UnitTotalPowerCapacityKw.Value;
                        equipment.unit.totalHeatCapacityKw = UnitTotalHeatCapacityKw == null ? 0.0 : (double)UnitTotalHeatCapacityKw?.Value;
                        equipment.unit.fuelInputKw = UnitFuelInputKw == null ? 0.0 : (double)UnitFuelInputKw?.Value;
                        equipment.unit.powerEfficiency = UnitPowerEfficiency == null ? 0.0 : (double)UnitPowerEfficiency?.Value;
                        equipment.unit.maxHeatToPowerRatio = UnitMaxHeatToPowerRatio == null ? 0.0 : (double)UnitMaxHeatToPowerRatio?.Value;
                        equipment.unit.maxHeatEfficiency = UnitMaxHeatEfficiency == null ? 0.0 : (double)UnitMaxHeatEfficiency?.Value;
                        equipment.unit.maxOverallEfficiency = UnitMaxOverallEfficiency == null ? 0.0 : (double)UnitMaxOverallEfficiency?.Value;

                        // GET ENGINE
                        if (entity.Attributes.Contains("Unit.desnz_engine") && entity["Unit.desnz_engine"] != null)
                        {
                            AliasedValue engineEntity = (AliasedValue)entity["Unit.desnz_engine"];

                            EntityReference engineEntityRef = engineEntity.Value as EntityReference;

                            Guid engineId = engineEntityRef == null ? Guid.Empty : engineEntityRef.Id;
                            string engineName = engineEntityRef?.Name ?? string.Empty;
                            
                            equipment.unit.engine = new ReplyEngine();
                            equipment.unit.engine.id = engineId;
                            equipment.unit.engine.name = engineName;
                        }

                        // GET MODEL
                        if (entity.Attributes.Contains("Unit.desnz_model") && entity["Unit.desnz_model"] != null)
                        {
                            AliasedValue modelEntity = (AliasedValue)entity["Unit.desnz_model"];

                            EntityReference modelEntityRef = modelEntity.Value as EntityReference;

                            Guid modelId = modelEntityRef == null ? Guid.Empty : modelEntityRef.Id;
                            string modelName = modelEntityRef?.Name ?? string.Empty;


                            equipment.unit.model = new ReplyModel();
                            equipment.unit.model.id = modelId;
                            equipment.unit.model.name = modelName;
                        }

                        // GET MANUFACTURER
                        if (entity.Attributes.Contains("Unit.desnz_manufacturer") && entity["Unit.desnz_manufacturer"] != null)
                        {
                            AliasedValue manufacturerEntity = (AliasedValue)entity["Unit.desnz_manufacturer"];

                            EntityReference manufacturerEntityRef = manufacturerEntity.Value as EntityReference;

                            Guid manufacturerId = manufacturerEntityRef == null ? Guid.Empty : manufacturerEntityRef.Id;
                            string manufacturerName = manufacturerEntityRef?.Name ?? string.Empty;

                            equipment.unit.manufacturer = new ReplyManufacturer();
                            equipment.unit.manufacturer.id = manufacturerId;
                            equipment.unit.manufacturer.name = manufacturerName;
                        }

                        entities.Add(equipment);
                    }

                    // Convert equipment IDs list to string array
                    string[] equipmentsIdsArray = equipmentsIds.ToArray();
                    
                    if (equipmentsIdsArray.Length != 0)
                    {
                        // get the files of equipment
                        QueryExpression query = new QueryExpression
                        {
                            EntityName = "desnz_equipmentfiles", // Specify the name of the parent entity
                            ColumnSet = new ColumnSet("desnz_equipmentfilesid", "desnz_name", "desnz_equipment"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                {
                                    new ConditionExpression("desnz_equipment", ConditionOperator.In, equipmentsIdsArray)
                                }
                            }
                        };

                        EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                        foreach (ReplyEquipment equipment in entities)
                        {
                            equipment.equipmentFilesList = new List<ReplyEquipmentFile>();

                            foreach (Entity file in results.Entities)
                            {

                                ReplyEquipmentFile equipmentFile = new ReplyEquipmentFile();
                                equipmentFile.id = file.GetAttributeValue<Guid>("desnz_equipmentfilesid");
                                equipmentFile.name = file.GetAttributeValue<string>("desnz_name");

                                // Get equipment type details
                                EntityReference equipFileEntityRef = null;
                                if (file.Attributes.Contains("desnz_equipment") && file["desnz_equipment"] != null)
                                {
                                    equipFileEntityRef = file["desnz_equipment"] as EntityReference;
                                }

                                Guid equipFileId = equipFileEntityRef == null ? Guid.Empty : equipFileEntityRef.Id;
                                string equipFileName = equipFileEntityRef?.Name ?? string.Empty;

                                // if there is a reference of current equipment id in equipment file
                                if (equipment.id == equipFileId)
                                {
                                    equipment.equipmentFilesList.Add(equipmentFile);
                                }
                            }
                        }
                    
                        foreach (Entity file in results.Entities)
                        {
                            ReplyEquipmentFile equipmentFile = new ReplyEquipmentFile();

                            equipmentFile.id = file.GetAttributeValue<Guid>("desnz_equipmentfilesid");
                            equipmentFile.name = file.GetAttributeValue<string>("desnz_name");

                            //equipment.equipmentFilesList.Add(equipmentFile);
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
