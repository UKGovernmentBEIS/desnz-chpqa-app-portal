using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class CreateManufactModelEngineUnit : ControllerBase
    {
        private readonly ILogger<CreateManufactModelEngineUnit> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public CreateManufactModelEngineUnit(ILogger<CreateManufactModelEngineUnit> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Create a new engineUnit with it's new Manufacturer and new Model from the given data.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the ids of the new engineUnit and it's new Manufacturer and new Model</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("CreateManufactModelEngineUnit")]
        [SwaggerOperation(Summary = "Create Manufacturer Model Engine Unit", Description = "Create a new engineUnit with it's new Manufacturer and new Model from the given data.")]
        [ProducesResponseType(typeof(RequestReturnManuModelEngineUnitId), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]
        public async Task<ActionResult<RequestReturnManuModelEngineUnitId>> PostManufactModelEngineUnit(RequestCreateManufactModelEngineUnit data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    RequestReturnManuModelEngineUnitId returnIds = new RequestReturnManuModelEngineUnitId();
                    returnIds.manufacturer = new ReplyManufacturer();
                    returnIds.model = new ReplyModel();
                    returnIds.engine = new ReplyEngine();
                    returnIds.engineUnit = new ReplyEngineUnit();


                    if (data != null)
                    {

                        Entity manufacturer = new("desnz_manufacturer");
                        Entity model = new("desnz_modelnumber");
                        Entity engine = new("desnz_engine");
                        Entity unit = new("desnz_unit");

                        // new MANUFACTURER ///////////
                        if (data.manufacturerOther != null)
                        {

                            manufacturer["desnz_name"] = data.manufacturerOther;
                            
                            // create Manufacturer
                            manufacturer.Id = await serviceClient.CreateAsync(manufacturer);

                            /*if (manufacturer != null)
                            {
                                manufacturer["statecode"] = new OptionSetValue(1);     // deactivate new entry

                                //await serviceClient.UpdateAsync(manufacturer);

                            }*/
                            returnIds.manufacturer.id = manufacturer.Id;
                            returnIds.manufacturer.name = data.manufacturerOther;
                        }
                        /*else if (data.manufacturer != null && data.manufacturerOther == null) //given id of manufacturer
                        {
                            returnIds.manufacturer.id = data.manufacturer.id;
                            returnIds.manufacturer.name = data.manufacturer.name;
                        }*/

                        // new MODEL ////////////
                        if (data.modelOther != null)
                        {

                            model["desnz_name"] = data.modelOther;

                            // relationship with manufacturer
                            model["desnz_manufacturer"] = new EntityReference("desnz_manufacturer", returnIds.manufacturer.id ?? Guid.Empty);
                            
                            // create Model
                            model.Id = await serviceClient.CreateAsync(model);

                            /*if (model != null)
                            {
                                model["statecode"] = new OptionSetValue(1);     // deactivate new entry

                                //await serviceClient.UpdateAsync(model);

                            }*/
                            returnIds.model.id = model.Id;
                            returnIds.model.name = data.modelOther;

                        }
                        /*else if (data.model != null && data.modelOther == null)     //given id of model
                        {
                            returnIds.model.id = data.model.id;
                            returnIds.model.name = data.model.name;
                        }*/


                        // new ENGINE ////////////
                        if (data.engineUnitOther != null)
                        {

                            engine["desnz_name"] = data.engineUnitOther;

                            // relationship with model
                            engine["desnz_model"] = new EntityReference("desnz_modelnumber", returnIds.model.id ?? Guid.Empty);
                            
                            // create Engine
                            engine.Id = await serviceClient.CreateAsync(engine);

                            returnIds.engine.id = engine.Id;
                            returnIds.engine.name = data.engineUnitOther;

                            /*if (engine != null)
                            {
                                engine["statecode"] = new OptionSetValue(1);     // deactivate new entry

                                //await serviceClient.UpdateAsync(engine);

                            }*/

                            // new UNIT ////////////
                            // set new unit name
                            unit["desnz_name"] = returnIds.manufacturer.name + " / " + returnIds.model.name + " / " + returnIds.engine.name;
                            
                            // relationship with manufacturer
                            unit["desnz_manufacturer"] = new EntityReference("desnz_manufacturer", returnIds.manufacturer.id ?? Guid.Empty);
                            
                            // relationship with model
                            unit["desnz_model"] = new EntityReference("desnz_modelnumber", returnIds.model.id ?? Guid.Empty);

                            // relationship with engine
                            unit["desnz_engine"] = new EntityReference("desnz_engine", engine?.Id ?? Guid.Empty);

                            unit["desnz_totalpowercapacitykw"] = data.totalPowerCapacityKw;
                            unit["desnz_totalheatcapacitykw"] = data.totalHeatCapacityKw;
                            unit["desnz_fuelinputkw"] = data.fuelInputKw;
                            unit["desnz_powerefficiency"] = data.powerEfficiency;
                            unit["desnz_maxheattopowerratio"] = data.maxHeatToPowerRatio;
                            unit["desnz_maxheatefficiency"] = data.maxHeatEfficiency;
                            unit["desnz_maxoverallefficiency"] = data.maxOverallEfficiency;
                            
                            // create Unit
                            unit.Id = await serviceClient.CreateAsync(unit);

                            if (unit != null)
                            {
                                unit["statecode"] = new OptionSetValue(1);     // deactivate new entry

                                await serviceClient.UpdateAsync(unit);

                            }

                            returnIds.engineUnit.id = unit.Id;
                            returnIds.engineUnit.name = (string)unit["desnz_name"];

                        }
                    }

                    _logger.LogInformation("Created new Engine and Unit with maybe new Manufacturer and/or new Model and at {DT} with id : {id}", DateTime.UtcNow.ToLongTimeString(), returnIds.engineUnit.id.ToString());

                    return Ok(returnIds);
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



        public class RequestCreateManufactModelEngineUnit
        {
            [Required]
            public Guid idSubmission { get; set; }
            //public RequestManufacturer? manufacturer { get; set; }

            public string? manufacturerOther { get; set; }

            //public RequestModel? model { get; set; }

            public string? modelOther { get; set; }

            public string? engineUnitOther { get; set; }
            
            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? totalPowerCapacityKw { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? totalHeatCapacityKw { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? fuelInputKw { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? powerEfficiency { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? maxHeatToPowerRatio { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? maxHeatEfficiency { get; set; }

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? maxOverallEfficiency { get; set; }

        }

        public class RequestManufacturer
        {
            public Guid? id { get; set; }
            public string? name { get; set; }
        }

        public class RequestModel
        {
            public Guid? id { get; set; }
            public string? name { get; set; }
        }
       
        public class ReplyEngineUnit
        {
            public Guid? id { get; set; }
            public string? name { get; set; }
        }

        public class RequestReturnManuModelEngineUnitId
        {

            public ReplyManufacturer? manufacturer { get; set; }
            public ReplyModel? model { get; set; }
            public ReplyEngine engine { get; set; }
            public ReplyEngineUnit? engineUnit { get; set; }

        }



    }
}

