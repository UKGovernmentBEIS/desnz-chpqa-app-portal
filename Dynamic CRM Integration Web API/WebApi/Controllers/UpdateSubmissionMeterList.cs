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
    public class UpdateSubmissionMeterList : ControllerBase
    {
        private readonly ILogger<UpdateSubmissionMeterList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdateSubmissionMeterList(ILogger<UpdateSubmissionMeterList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Meter List with the given Meter that is created.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the new Meter</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<ReplyReturnIdName>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("UpdateSubmissionMeterList")]
        [SwaggerOperation(Summary = "Update Submission Meter List", Description = "Update a Submission Meter List with the given Meter List.")]
        public async Task<ActionResult<List<ReplyReturnIdName>>> SubmissionMeterList(RequestUpdateSubmissionMeterList data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();


                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(new Guid(data.idSubmission), serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    List<ReplyReturnIdName> returnIdNameList = new List<ReplyReturnIdName>();


                    if (data == null)
                    {
                        reply.message = "data is null";
                        return BadRequest(reply);
                    }

                    if (data.meterList == null || data.meterList.Count < 0)
                    {
                            reply.message = "Meter List is empty or null";
                        return BadRequest(reply);
                    }
                    foreach (RequestMeter meterData in data.meterList)
                    {
                        if (meterData == null)
                        {
                            reply.message = "Meter List has null entry";
                            return BadRequest(reply);
                        }
                    }

                    // get submission type simple or complex
                    Entity submissionResult = await serviceClient.RetrieveAsync("desnz_submission", new Guid(data.idSubmission), new ColumnSet("desnz_submissionid", "desnz_submissionformtype"));

                    Submission submission = new Submission();

                    submission.id = submissionResult.GetAttributeValue<Guid>("desnz_submissionid");
                    if (submissionResult.Attributes.ContainsKey("desnz_submissionformtype") && submissionResult["desnz_submissionformtype"] is OptionSetValue optionSetValueFormType)
                    {
                        submission.submissionFormType = optionSetValueFormType.Value;
                    }

                    //get meter of submission

                    // check data.meters ids with meters in DB
                   // List<ReplyMeter> entities = new List<ReplyMeter>();

                    // get METERs
                    QueryExpression meterQuery = new QueryExpression
                    {
                        EntityName = "desnz_fuelmeters", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_fuelmetersid", "desnz_name", "desnz_tagnum", "desnz_measuretype"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, data.idSubmission )
                            }
                        }
                    };

                    EntityCollection meterResults = await serviceClient.RetrieveMultipleAsync(meterQuery);

                    List<Guid> metersIds = new List<Guid>(); // List to store meter IDs

                    //take all meter ids from request data
                    foreach (RequestMeter meterData in data.meterList)
                    {
                        if(meterData.id != null)
                        {
                            metersIds.Add(meterData.id ?? Guid.Empty);
                        }
                    }

                    List<Guid> metersIdsDB = new List<Guid>(); // List to store meter IDs ofDB

                    Dictionary<Guid, int> meterDictDB = new Dictionary<Guid, int>();
                    
                    //check meter ids validity
                    foreach (Entity entity in meterResults.Entities)
                    {

                        ReplyMeter meter = new ReplyMeter();

                        meter.id = entity.GetAttributeValue<Guid>("desnz_fuelmetersid");
                        if (entity.Attributes.ContainsKey("desnz_measuretype") && entity["desnz_measuretype"] is OptionSetValue optionSetValueMaingasmeter)
                        {
                            meter.measureType = optionSetValueMaingasmeter.Value;
                        }

                        metersIdsDB.Add(meter.id ?? Guid.Empty);

                        meterDictDB.Add(meter.id ?? Guid.Empty, meter.measureType ?? -1);
                    }
                    foreach (Guid meterid in metersIds)
                    {
                        // if request has a meter id that it is not in the DB error
                        if (!metersIdsDB.Contains(meterid))
                        {
                            reply.message = "A Meter id is not of this Submission";
                            return BadRequest(reply);
                        }
                    }

                    // if in simple form check if we have meters with same measure type
                    if (submission.submissionFormType == (int)Submission.SubmissionFormType.F2s || (submission.submissionFormType == (int)Submission.SubmissionFormType.F4s)) {

                        int energyFlag = 0;
                        int powerFlag = 0;
                        int heatFlag = 0;

                        // check if the meters from front are valid about measure types count
                        foreach (RequestMeter meterData in data.meterList)
                        {

                            if(meterData.measureType == (int)Meter.MeasureType.EnergyInput)
                            {
                                energyFlag++;
                            }
                            else if (meterData.measureType == (int)Meter.MeasureType.PowerOutput)
                            {
                                powerFlag++;
                            }
                            else if (meterData.measureType == (int)Meter.MeasureType.HeatOutput)
                            {
                                heatFlag++;
                            }
                        }

                        //check if the meters from DB are valid about measure types after we include new meters and updates from front
                        foreach (var meterDB in meterDictDB)
                        {
                            // if id was already in the request meters we have count the measure types
                            if ( !metersIds.Contains(meterDB.Key)){

                                if (meterDB.Value == (int)Meter.MeasureType.EnergyInput)
                                {
                                    energyFlag++;
                                }
                                else if (meterDB.Value == (int)Meter.MeasureType.PowerOutput)
                                {
                                    powerFlag++;
                                }
                                else if (meterDB.Value == (int)Meter.MeasureType.HeatOutput)
                                {
                                    heatFlag++;
                                }
                            }
                        }

                        if (energyFlag > 1 || powerFlag > 1 || heatFlag > 1)
                        {
                            reply.message = "Meter's measure type cannot be more than each of the 3 types in simple form";
                            return BadRequest(reply);
                        }
                    }

                   



                    // METER  /////////////////
                    foreach (RequestMeter meterData in data.meterList)
                    {

                        Entity meter = null;

                        if (meterData.id == null)
                        {
                            meter = new("desnz_fuelmeters");
                        }
                        else
                        {
                            meter = new Entity("desnz_fuelmeters", meterData.id ?? Guid.Empty);       // get current meter
                        }

                        meter["desnz_name"] = meterData.name;
                        meter["desnz_tagnum"] = meterData.tagNumber;
                        meter["desnz_serialnumber"] = meterData.serialNumber;
                        meter["desnz_yearinstalled"] = meterData.yearInstalled;

                        meter["desnz_existingorproposed"] = new OptionSetValue(meterData.existingOrProposed ?? (int)Meter.ExistingOrProposed.Existing);
                        meter["desnz_maingasmeter"] = meterData.mainGasMeter;
                        meter["desnz_maingasmeternumber"] = meterData.mainGasMeterNumber;

                        meter["desnz_outputrangeminimumflowrate"] = meterData.outputRangeMin;
                        meter["desnz_outputrangemaximumflowrate"] = meterData.outputRangeMax;

                        // output unit
                        if (meterData.outputUnit != null)
                        {
                            // output unit relationship
                            meter["desnz_outputunit"] = new EntityReference("desnz_outputunit", meterData.outputUnit.id ?? Guid.Empty);
                        }

                        meter["desnz_uncertainty"] = meterData.uncertainty;
                        meter["desnz_comments"] = meterData.comments;

                        //give id of equipment Type
                        if (meterData.equipmentTypeId != null)
                        {
                            // equipment relationship
                            meter["desnz_equipmenttype"] = new EntityReference("desnz_equipmenttype", meterData.equipmentTypeId ?? Guid.Empty);
                        }
                        //give id of equipment Sub Type
                        if (meterData.equipmentSubTypeId != null)
                        {
                            // equipment relationship
                            meter["desnz_equipmentsubtype"] = new EntityReference("desnz_equipmentsubtype", meterData.equipmentSubTypeId ?? Guid.Empty);
                        }

                        meter["desnz_measuretype"] = new OptionSetValue(meterData.measureType ?? (int)Meter.MeasureType.EnergyInput);

                        //relationship
                        meter["desnz_submission"] = new EntityReference("desnz_submission", new Guid(data.idSubmission));

                        if (meterData.id == null)
                        {
                            // create Meter
                            meter.Id = await serviceClient.CreateAsync(meter);

                            _logger.LogInformation("Created new Meter at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), meter.Id.ToString());

                            // for meter
                            // update submission group status and check to unlock next groups
                            await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.AddMeterDetails, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);

                        }
                        else    // if we update a meter
                        {

                            // for meter
                            // update submission group status and check to unlock next groups
                            await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), (int)SubmissionGroups.GroupType.AddMeterDetails, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger, UpdSectionStatusesFun.ModeFlag.Delete);

                            // update Meter
                            await serviceClient.UpdateAsync(meter);

                            _logger.LogInformation("Updated Meter at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), meter.Id.ToString());
                        }

                        
                        //update Submission status and latest submission status of Scheme
                        await UpdSubmStatusInSchemeFun.UpdSubmStatusInScheme(new Guid(data.idSubmission), (int)Submission.SubmissionStatus.InProgress, serviceClient, _logger);

                        ReplyReturnIdName returnIdName = new ReplyReturnIdName();
                        returnIdName.id = meter.Id;
                        returnIdName.name = (string)meter["desnz_name"];
                        returnIdNameList.Add(returnIdName);

                        _logger.LogInformation("Created new Meter at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), returnIdName.id.ToString());


                        int energyPowerHeatGroup = -1;

                        if (meterData.id == null) // create input or output for the new meter
                        {
                            await CreateEnergyInputHeatOrPowerOutput.CreateFun(meterData, meter, energyPowerHeatGroup, new Guid(data.idSubmission), serviceClient, _logger);

                        }
                        else        // update input or output if different measure type
                        {

                            foreach(Entity oldMeterEntity in meterResults.Entities)
                            {
                                // find the old meter data
                                if(meterData.id == oldMeterEntity.Id)
                                {
                                    ReplyMeter oldMeter = new ReplyMeter();

                                    oldMeter.id = oldMeterEntity.GetAttributeValue<Guid>("desnz_fuelmetersid");
                                    if (oldMeterEntity.Attributes.ContainsKey("desnz_measuretype") && oldMeterEntity["desnz_measuretype"] is OptionSetValue optionSetValueMaingasmeter)
                                    {
                                        oldMeter.measureType = optionSetValueMaingasmeter.Value;
                                    }

                                    // if true, delete the old input / output and create a new one
                                    if(meterData.measureType != oldMeter.measureType)
                                    {
                                        
                                        string entityName = "desnz_fuelinputs";
                                        string entityId = "desnz_fuelinputsid";
                                        string entityAnnualTotal = "desnz_annualtotal";
                                        int groupTypeEnergyPowerHeat = (int)SubmissionGroups.GroupType.ProvideEnergyInputs;

                                        if (oldMeter.measureType == (int)Meter.MeasureType.EnergyInput)     // Energy inputs
                                        {
                                            entityName = "desnz_fuelinputs";
                                            entityId = "desnz_fuelinputsid";
                                            entityAnnualTotal = "desnz_annualtotal";
                                            groupTypeEnergyPowerHeat = (int)SubmissionGroups.GroupType.ProvideEnergyInputs;
                                        }
                                        else if (oldMeter.measureType == (int)Meter.MeasureType.PowerOutput)    // Power outputs
                                        {
                                            entityName = "desnz_poweroutputs";
                                            entityId = "desnz_poweroutputsid";
                                            entityAnnualTotal = "desnz_annualtotal";
                                            groupTypeEnergyPowerHeat = (int)SubmissionGroups.GroupType.ProvidePowerOutputs;
                                        }
                                        else if (oldMeter.measureType == (int)Meter.MeasureType.HeatOutput)    // Heat outputs
                                        {
                                            entityName = "desnz_heatoutput";
                                            entityId = "desnz_heatoutputid";
                                            entityAnnualTotal = "desnz_annualtotal";
                                            groupTypeEnergyPowerHeat = (int)SubmissionGroups.GroupType.ProvideHeatOutputs;
                                        }

                                        QueryExpression energyPowerHeatQuery = new QueryExpression
                                        {
                                            EntityName = entityName, // Specify the name of the parent entity
                                            ColumnSet = new ColumnSet(entityId, "desnz_name", entityAnnualTotal),
                                            Criteria = new FilterExpression
                                            {
                                                Conditions =
                                                {
                                                    new ConditionExpression("desnz_meter", ConditionOperator.Equal, oldMeter.id )
                                                }
                                            }
                                        };

                                        EntityCollection energyPowerHeatesults = await serviceClient.RetrieveMultipleAsync(energyPowerHeatQuery);

                                        // if we have a match entity delete it
                                        if(energyPowerHeatesults.Entities.Count > 0)
                                        {
                                            Guid energyPoweHeatId =  energyPowerHeatesults.Entities[0].GetAttributeValue<Guid>(entityId);

                                            await serviceClient.DeleteAsync(entityName, energyPoweHeatId);

                                            // update submission group status and check to unlock next groups
                                            await UpdSectionStatusesFun.ChangeSectionStatuses(new Guid(data.idSubmission), groupTypeEnergyPowerHeat, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger, UpdSectionStatusesFun.ModeFlag.Delete);

                                            // do calculations for deleted entity

                                            if (oldMeter.measureType == (int)Meter.MeasureType.EnergyInput)     // Energy inputs
                                            {
                                                await UpdEnergyInputsXYCalc.CalculateAsync(new Guid(data.idSubmission), serviceClient);
                                                await UpdEnergyInputsCalc.CalculateAsync(new Guid(data.idSubmission), serviceClient);
                                            }
                                            else if (oldMeter.measureType == (int)Meter.MeasureType.PowerOutput)    // Power outputs
                                            {
                                                await UpdPowerOutputsCalc.CalculateAsync(new Guid(data.idSubmission), serviceClient);
                                            }
                                            else if (oldMeter.measureType == (int)Meter.MeasureType.HeatOutput)    // Heat outputs
                                            {
                                                await UpdHeatOutputsCalc.CalculateAsync(new Guid(data.idSubmission), serviceClient);
                                            }

                                        }
                                        // and make the new energy heat or power also updates the status to inprogress if new

                                        await CreateEnergyInputHeatOrPowerOutput.CreateFun(meterData, meter, energyPowerHeatGroup, new Guid(data.idSubmission), serviceClient, _logger);

                                    }


                                }


                            }





                        }
                    }

                   
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

        public class RequestUpdateSubmissionMeterList
        {
            [Required]
            public string? idSubmission { get; set; }
            
            [Required]
            public List<RequestMeter>? meterList { get; set; }

        }

    }
}
