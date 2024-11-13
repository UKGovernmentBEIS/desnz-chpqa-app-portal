using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]

    public class GetMeterListBySubmissionId : ControllerBase
    {
        private readonly ILogger<GetMeterListBySubmissionId> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetMeterListBySubmissionId(ILogger<GetMeterListBySubmissionId> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves Details of Meter List By Submission Id.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of Meters with their details by the given id of a Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetMeterListBySubmissionId")]
        [SwaggerOperation(Summary = "Get Meter List By Submission Id", Description = "Retrieves Details of Meter List By Submission Id.")]
        [ProducesResponseType(typeof(List<ReplyMeter>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<List<ReplyMeter>>> MeterListBySubmissionId(Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {  
                    List<ReplyMeter> entities = new List<ReplyMeter>();

                    // METER
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_fuelmeters", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_fuelmetersid", "desnz_name", "desnz_tagnum", "desnz_serialnumber", "desnz_yearinstalled",
                            "desnz_maingasmeter", "desnz_maingasmeternumber", "desnz_measuretype", "desnz_existingorproposed", "desnz_equipmenttype",
                            "desnz_equipmentsubtype", "desnz_outputunit", "desnz_outputrangeminimumflowrate", "desnz_outputrangemaximumflowrate",
                            "desnz_uncertainty", "desnz_comments"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                            }
                        }
                    };

                    EntityCollection relatedModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    List<string> metersIds = new List<string>(); // List to store meter IDs

                    foreach (Entity entity in relatedModelresults.Entities)
                    {

                        ReplyMeter meter = new ReplyMeter();

                        meter.id = entity.GetAttributeValue<Guid>("desnz_fuelmetersid");
                        metersIds.Add(meter.id.ToString());
                        meter.name = entity.GetAttributeValue<string>("desnz_name");
                        meter.tagNumber = entity.GetAttributeValue<string>("desnz_tagnum");
                        meter.serialNumber = entity.GetAttributeValue<string>("desnz_serialnumber");
                        meter.yearInstalled = entity.GetAttributeValue<int>("desnz_yearinstalled");
                        meter.mainGasMeter = entity.GetAttributeValue<bool?>("desnz_maingasmeter");
                        meter.mainGasMeterNumber = entity.GetAttributeValue<string>("desnz_maingasmeternumber");


                        if (entity.Attributes.ContainsKey("desnz_measuretype") && entity["desnz_measuretype"] is OptionSetValue optionSetValueMaingasmeter)
                        {
                            meter.measureType = optionSetValueMaingasmeter.Value;
                        }
                    
                        if (entity.Attributes.ContainsKey("desnz_existingorproposed") && entity["desnz_existingorproposed"] is OptionSetValue optionSetValueSubmissionFormType)
                        {
                            meter.existingOrProposed = optionSetValueSubmissionFormType.Value;
                        }

                        // Get equipment type details
                        EntityReference equipTypeEntityRef = null;
                        if (entity.Attributes.Contains("desnz_equipmenttype") && entity["desnz_equipmenttype"] != null)
                        {
                            equipTypeEntityRef = entity["desnz_equipmenttype"] as EntityReference;

                            Guid equipTypeId = equipTypeEntityRef == null ? Guid.Empty : equipTypeEntityRef.Id;
                            string equipTypeName = equipTypeEntityRef?.Name ?? string.Empty;

                            meter.equipmentType = new ReplyEquipmentType();
                            meter.equipmentType.id = equipTypeId;
                            meter.equipmentType.name = equipTypeName;
                        }

                        

                        // Get equipment type details
                        EntityReference equipSubTypeEntityRef = null;
                        if (entity.Attributes.Contains("desnz_equipmentsubtype") && entity["desnz_equipmentsubtype"] != null)
                        {
                            equipSubTypeEntityRef = entity["desnz_equipmentsubtype"] as EntityReference;

                            Guid equipSubTypeId = equipSubTypeEntityRef == null ? Guid.Empty : equipSubTypeEntityRef.Id;
                            string equipSubTypeName = equipSubTypeEntityRef?.Name ?? string.Empty;

                            meter.equipmentSubType = new ReplyEquipmentSubType();
                            meter.equipmentSubType.id = equipSubTypeId;
                            meter.equipmentSubType.name = equipSubTypeName;
                        }


                        // Get output unit details
                        EntityReference outputUnitEntityRef = null;
                        if (entity.Attributes.Contains("desnz_outputunit") && entity["desnz_outputunit"] != null)
                        {
                            outputUnitEntityRef = entity["desnz_outputunit"] as EntityReference;
                            Guid outputUnitId = outputUnitEntityRef == null ? Guid.Empty : outputUnitEntityRef.Id;
                            string outputUnitName = outputUnitEntityRef?.Name ?? string.Empty;

                            meter.outputUnit = new OutputUnit();
                            meter.outputUnit.id = outputUnitId;
                            meter.outputUnit.name = outputUnitName;
                        }


                        //meter.meteredService = entity.GetAttributeValue<int>("desnz_meteredservice");
                        //meter.meteredServiceF2s = entity.GetAttributeValue<int>("desnz_meteredservicef2s");
                        meter.outputRangeMin = entity.GetAttributeValue<decimal>("desnz_outputrangeminimumflowrate");
                        meter.outputRangeMax = entity.GetAttributeValue<decimal>("desnz_outputrangemaximumflowrate");
                        meter.uncertainty = entity.GetAttributeValue<double>("desnz_uncertainty");
                            
                        meter.comments = entity.GetAttributeValue<string>("desnz_comments");

                        entities.Add(meter);

                    }

                    // Convert meter IDs list to string array
                    string[] metersIdsArray = metersIds.ToArray();

                    if (metersIdsArray.Length != 0)
                    {
                        // get the files of meter
                        QueryExpression query = new QueryExpression
                        {
                            EntityName = "desnz_meterfiles", // Specify the name of the parent entity
                            ColumnSet = new ColumnSet("desnz_meterfilesid", "desnz_name", "desnz_meter"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                {
                                    new ConditionExpression("desnz_meter", ConditionOperator.In, metersIdsArray)
                                }
                            }
                        };

                        EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                        foreach (ReplyMeter meter in entities)
                        {
                            meter.meterFilesList = new List<ReplyMeterFile>();

                            foreach (Entity file in results.Entities)
                            {

                                ReplyMeterFile meterFile = new ReplyMeterFile();
                                meterFile.id = file.GetAttributeValue<Guid>("desnz_meterfilesid");
                                meterFile.name = file.GetAttributeValue<string>("desnz_name");

                                // Get equipment type details
                                EntityReference meterFileEntityRef = null;
                                if (file.Attributes.Contains("desnz_meter") && file["desnz_meter"] != null)
                                {
                                    meterFileEntityRef = file["desnz_meter"] as EntityReference;
                                }

                                Guid meterFileId = meterFileEntityRef == null ? Guid.Empty : meterFileEntityRef.Id;
                                string meterFileName = meterFileEntityRef?.Name ?? string.Empty;

                                // if there is a reference of current meter id in meter file
                                if (meter.id == meterFileId)
                                {
                                    meter.meterFilesList.Add(meterFile);
                                }
                            }
                        }
                        foreach (Entity file in results.Entities)
                        {
                            ReplyMeterFile meterFile = new ReplyMeterFile();

                            meterFile.id = file.GetAttributeValue<Guid>("desnz_meterfilesid");
                            meterFile.name = file.GetAttributeValue<string>("desnz_name");

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
