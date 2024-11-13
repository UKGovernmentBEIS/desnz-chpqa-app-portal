using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdateSubmissionEquipmentList : ControllerBase
    {
        private readonly ILogger<UpdateSubmissionEquipmentList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdateSubmissionEquipmentList(ILogger<UpdateSubmissionEquipmentList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Equipment List with the given Equipment that is created.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the new Equipment</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdateSubmissionEquipmentList")]
        [SwaggerOperation(Summary = "Update Submission Equipment List", Description = "Update a Submission Equipment List with the given Equipment.")]
        [ProducesResponseType(typeof(List<ReplyReturnIdName>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<List<ReplyReturnIdName>>> SubmissionEquipmentList(RequestUpdateSubmissionEquipmentList data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();
               

                    //
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(data.idSubmission), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    Entity resultSubmission = await serviceClient.RetrieveAsync("desnz_submission", new Guid(data.idSubmission), new ColumnSet("desnz_chptotalpowercapacity", "desnz_chptotalheatcapacity", "desnz_chpmaxheat"));

                    List<ReplyReturnIdName> returnIdNameList = new List<ReplyReturnIdName>();




                    if (data == null)
                    {
                        reply.message = "data is null";
                        return BadRequest(reply);
                    }

                    if (data.equipmentList == null || data.equipmentList.Count < 0)
                    {
                        reply.message = "Equipment List is empty or null";
                        return BadRequest(reply);
                    }

                    foreach (RequestEquipment equipmentData in data.equipmentList)
                    {
                        if (equipmentData == null)
                        {
                            reply.message = "Equipment List has null entry";
                            return BadRequest(reply);
                        }
                    }

                    //get equipment of submission

                    // check data.equipments ids with equipments in DB
                    List<ReplyEquipment> entities = new List<ReplyEquipment>();

                    // get equipments
                    QueryExpression equipmentsQuery = new QueryExpression
                    {
                        EntityName = "desnz_primemovers", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_primemoversid", "desnz_name", "desnz_tagnum", "desnz_unit"),
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_primemovers", // Parent entity
                                LinkFromAttributeName = "desnz_unit", // Parent entity attribute
                                LinkToEntityName = "desnz_unit", // Related entity
                                LinkToAttributeName = "desnz_unitid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_unitid", "desnz_name", "desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw"),
                                EntityAlias = "Unit"
                            }
                        },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, data.idSubmission )
                            }
                        }
                    };

                    EntityCollection equipmentsResults = await serviceClient.RetrieveMultipleAsync(equipmentsQuery);

                    List<Guid> equipmentIds = new List<Guid>(); // List to store equipment IDs

                    //take all meter ids from request data
                    foreach (RequestEquipment equipmentData in data.equipmentList)
                    {
                        if (equipmentData.id != null)
                        {
                            equipmentIds.Add(equipmentData.id ?? Guid.Empty);
                        }
                    }

                    List<Guid> equipmentIdsDB = new List<Guid>(); // List to store equipment IDs of DB

                    

                    //check equipment ids validity
                    foreach (Entity entity in equipmentsResults.Entities)
                    {

                        ReplyEquipment equipment = new ReplyEquipment();

                        equipment.id = entity.GetAttributeValue<Guid>("desnz_primemoversid");
                       
                        equipmentIdsDB.Add(equipment.id ?? Guid.Empty);

                    }
                    foreach (Guid equipmentId in equipmentIds)
                    {
                        // if request has a equipment id that it is not in the DB error
                        if (!equipmentIdsDB.Contains(equipmentId))
                        {
                            reply.message = "A Prime mover id is not of this Submission";
                            return BadRequest(reply);
                        }
                    }





                    //Calculations of equipment list vars
                    double chptotalpowercapacity = 0.0;
                    double chptotalheatcapacity = 0.0;
                    double chpmaxheat = 0.0;

                    // get values of equipment for calculations
                    chptotalpowercapacity = resultSubmission.GetAttributeValue<double>("desnz_chptotalpowercapacity");
                    chptotalheatcapacity = resultSubmission.GetAttributeValue<double>("desnz_chptotalheatcapacity");
                    chpmaxheat = resultSubmission.GetAttributeValue<double>("desnz_chpmaxheat");

                    
                    // EQUIPMENT  /////////////////
                    foreach (RequestEquipment equipmentData in data.equipmentList) {

                        Entity equipment = null;

                        if (equipmentData.id == null)
                        {
                            equipment = new("desnz_primemovers");
                        }
                        else
                        {
                            equipment = new Entity("desnz_primemovers", equipmentData.id ?? Guid.Empty);       // get current equipment
                        }

                        equipment["desnz_name"] = equipmentData.name;
                        equipment["desnz_tagnum"] = equipmentData.tagNumber;
                        equipment["desnz_yearcommissioned"] = equipmentData.yearCommissioned;
                        equipment["desnz_mechanicalload"] = equipmentData.mechanicalLoad;
                        equipment["desnz_comments"] = equipmentData.comments;

                        //give id of equipment Type
                        if (equipmentData.equipmentTypeId != null)
                        {
                            // equipment relationship
                            equipment["desnz_equipmenttype"] = new EntityReference("desnz_equipmenttype", equipmentData.equipmentTypeId ?? Guid.Empty);
                        }
                        //give id of equipment Sub Type
                        if (equipmentData.equipmentSubTypeId != null)
                        {
                            // equipment relationship
                            equipment["desnz_equipmentsubtype"] = new EntityReference("desnz_equipmentsubtype", equipmentData.equipmentSubTypeId ?? Guid.Empty);
                        }

                        //give id of manufacturer
                        if (equipmentData.manufacturerId != null)
                        {
                            // equipment relationship
                            equipment["desnz_manufacturer"] = new EntityReference("desnz_manufacturer", equipmentData.manufacturerId ?? Guid.Empty);
                        }

                        //give id of model
                        if (equipmentData.modelId != null)
                        {
                            // equipment relationship
                            equipment["desnz_model"] = new EntityReference("desnz_modelnumber", equipmentData.modelId ?? Guid.Empty);
                        }

                        //give id of engine unit
                        if (equipmentData.engineUnitId != null)
                        {

                            // if new equipment
                            if (equipmentData.id == null)
                            {
                                // equipment relationship
                                equipment["desnz_unit"] = new EntityReference("desnz_unit", equipmentData.engineUnitId ?? Guid.Empty);

                                Entity resultUnit = await serviceClient.RetrieveAsync("desnz_unit", equipmentData.engineUnitId ?? Guid.Empty, new ColumnSet("desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw"));

                                // calculations for given unit
                                chptotalpowercapacity += (double)resultUnit["desnz_totalpowercapacitykw"];
                                chptotalheatcapacity += (double)resultUnit["desnz_totalheatcapacitykw"];
                                chpmaxheat += (double)resultUnit["desnz_totalheatcapacitykw"];

                            }
                            else  // if old equipment
                            {

                                foreach (Entity oldEquipmentEntity in equipmentsResults.Entities)
                                {
                                    // find the old equipment data
                                    if (equipmentData.id == oldEquipmentEntity.Id)
                                    {
                                        ReplyEquipment oldEquipment = new ReplyEquipment();

                                        oldEquipment.id = oldEquipmentEntity.GetAttributeValue<Guid>("desnz_primemoversid");

                                        // Get unit id
                                        AliasedValue UnitId = (AliasedValue)oldEquipmentEntity["Unit.desnz_unitid"];
                                        AliasedValue UnitName = (AliasedValue)oldEquipmentEntity["Unit.desnz_name"];

                                        AliasedValue UnitTotalPowerCapacityKw = (AliasedValue)oldEquipmentEntity["Unit.desnz_totalpowercapacitykw"];
                                        AliasedValue UnitTotalHeatCapacityKw = (AliasedValue)oldEquipmentEntity["Unit.desnz_totalheatcapacitykw"];

                                        oldEquipment.unit = new ReplyUnit();
                                        oldEquipment.unit.id = UnitId == null ? Guid.Empty : (Guid)UnitId.Value;
                                        oldEquipment.unit.totalPowerCapacityKw = UnitTotalPowerCapacityKw == null ? 0.0 : (double)UnitTotalPowerCapacityKw.Value;
                                        oldEquipment.unit.totalHeatCapacityKw = UnitTotalHeatCapacityKw == null ? 0.0 : (double)UnitTotalHeatCapacityKw?.Value;

                                        // if there is a change in old equipment unit id
                                        if (equipmentData.engineUnitId != oldEquipment.unit.id)
                                        {
                                            // subtrack the power and heat from submission vars
                                            chptotalpowercapacity -= (double)oldEquipment.unit.totalPowerCapacityKw;
                                            chptotalheatcapacity -= (double)oldEquipment.unit.totalHeatCapacityKw;
                                            chpmaxheat -= (double)oldEquipment.unit.totalHeatCapacityKw;

                                            // equipment relationship with the new unit id
                                            equipment["desnz_unit"] = new EntityReference("desnz_unit", equipmentData.engineUnitId ?? Guid.Empty);

                                            Entity resultUnit = await serviceClient.RetrieveAsync("desnz_unit", equipmentData.engineUnitId ?? Guid.Empty, new ColumnSet("desnz_totalpowercapacitykw", "desnz_totalheatcapacitykw"));

                                            // add the new power and heat from unit to submission vars
                                            chptotalpowercapacity += (double)resultUnit["desnz_totalpowercapacitykw"];
                                            chptotalheatcapacity += (double)resultUnit["desnz_totalheatcapacitykw"];
                                            chpmaxheat += (double)resultUnit["desnz_totalheatcapacitykw"];

                                        }
                                        break;
                                    }

                                }
                            }
                            
                        }
                            
                        // relationship
                        equipment["desnz_submission"] = new EntityReference("desnz_submission", resultSubmission.Id);
                            
                        if(equipmentData.id == null)
                        {
                            // create Equipment
                            equipment.Id = await serviceClient.CreateAsync(equipment);
                                
                            _logger.LogInformation("Created new Equipment at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), equipment.Id.ToString());

                            // update submission group status and check to unlock next goups
                            await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.AddPrimeMoverDetails, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);

                        }
                        else
                        {
                            // update Equipment
                            await serviceClient.UpdateAsync(equipment);
                                
                            _logger.LogInformation("Updated Equipment at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), equipment.Id.ToString());

                            // update submission group status and check to unlock next goups
                            await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.AddPrimeMoverDetails, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger, UpdSectionStatusesFun.ModeFlag.Delete);

                        }


                        ReplyReturnIdName returnIdName = new ReplyReturnIdName();
                        returnIdName.id = equipment.Id;
                        returnIdName.name = (string)equipment["desnz_name"];

                        returnIdNameList.Add(returnIdName);

                    }

                    resultSubmission["desnz_chptotalpowercapacity"] = chptotalpowercapacity;    //data.submission.chpTotalPowerCapacity;
                    resultSubmission["desnz_chptotalheatcapacity"] = chptotalheatcapacity;      //chptotalheatcapacity;
                    resultSubmission["desnz_chpmaxheat"] = chpmaxheat;                          //chpmaxheat;

                        
                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);

                    // have to update X Y of energy inputs if the total power capacity has change range
                    await UpdEnergyInputsXYCalc.CalculateAsync(new Guid(data.idSubmission), serviceClient);

                    
                    //update Submission status and latest submission status of Scheme
                    await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(new Guid(data.idSubmission), (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                    // update submission with calculations of efficiencies and QI
                    await UpdSubmCalcEfficAndQIFun.CalculateAsync(new Guid(data.idSubmission), serviceClient);

                    _logger.LogInformation("Updated Submission with new Equipment List at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                


                    return Ok(returnIdNameList);
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

        public class RequestUpdateSubmissionEquipmentList
        {

            [Required]
            public string? idSubmission { get; set; }

            [Required]
            public List<RequestEquipment>? equipmentList { get; set; }

        }

        public class RequestEquipment
        {
            public Guid? id { get; set; }
            [Required] public string? name { get; set; }
            [Required] public string? tagNumber { get; set; }

            [Range(0, int.MaxValue, ErrorMessage = "The value must be a positive number.")]
            [Required] public int? yearCommissioned { get; set; }

            [Required] public Guid? equipmentTypeId { get; set; }

            public Guid? equipmentSubTypeId { get; set; }

            [Required] public bool? mechanicalLoad { get; set; }

            [Required] public Guid? manufacturerId { get; set; }

            [Required] public Guid? modelId { get; set; }

            [Required] public Guid? engineUnitId { get; set; }

            public string? comments { get; set; }


        }
    }
}
