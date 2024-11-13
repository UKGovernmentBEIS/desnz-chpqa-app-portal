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

    public class GetEnergyInputListBySubmId : ControllerBase
    {
        private readonly ILogger<GetEnergyInputListBySubmId> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetEnergyInputListBySubmId(ILogger<GetEnergyInputListBySubmId> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves Details of Energy Input List By Submission Id.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Todo
        ///     {
        ///         GetEnergyInputListBySubmId?id=3b8a8580-3835-ef11-8409-6045bddf4514
        ///     }
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of Energy Inputs with their details by the given id of a Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetEnergyInputListBySubmId")]
        [SwaggerOperation(Summary = "Get Energy Input List By Submission Id", Description = "Retrieves Details of Energy Input List By Submission Id.")]
        [ProducesResponseType(typeof(List<ReplyEnergyInput>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<List<ReplyEnergyInput>>> EnergyInputListBySubmId(Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    List<ReplyEnergyInput> entities = new List<ReplyEnergyInput>();

                    // Energy Input
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_fuelinputs", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_fuelinputsid", "desnz_name", "desnz_tagnum", "desnz_tagprefix", "desnz_tag", "desnz_serialnumber",
                            "desnz_calculationused", "desnz_meter", "desnz_year1", "desnz_january", "desnz_february", "desnz_march", "desnz_april", "desnz_may",
                            "desnz_june", "desnz_july", "desnz_august", "desnz_september", "desnz_october", "desnz_november", "desnz_december", 
                            "desnz_annualtotal", "desnz_xvalue", "desnz_yvalue", "desnz_fnxn", "desnz_fn_yn", "desnz_fractionoftotalfuelinput", 
                            "desnz_fuelcategory", "desnz_fuel"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_submission", ConditionOperator.Equal, idSubmission )
                            }
                        }
                    };

                    EntityCollection relatedModelresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                    foreach (Entity entity in relatedModelresults.Entities)
                    {

                        ReplyEnergyInput energyInput = new ReplyEnergyInput();

                        energyInput.id = entity.GetAttributeValue<Guid>("desnz_fuelinputsid");
                        energyInput.tag = entity.GetAttributeValue<string>("desnz_name");
                        energyInput.tagNumber = entity.GetAttributeValue<string>("desnz_tagnum");
                        energyInput.tagPrefix = entity.GetAttributeValue<string>("desnz_tagprefix");
                        energyInput.userTag = entity.GetAttributeValue<string>("desnz_tag");
                        energyInput.serialNumber = entity.GetAttributeValue<string>("desnz_serialnumber");
                        energyInput.includeInCalculations = entity.GetAttributeValue<bool?>("desnz_calculationused");

                        // Get meter id
                        if (entity.Attributes.Contains("desnz_meter") && entity["desnz_meter"] != null)
                        {
                            EntityReference meterEntityRef = entity["desnz_meter"] as EntityReference;

                            Guid meterId = meterEntityRef == null ? Guid.Empty : meterEntityRef.Id;
                            string meterName = meterEntityRef?.Name ?? string.Empty;

                            energyInput.meter = new ReplyInputsOutputsMeter();
                            energyInput.meter.id = meterId;
                            energyInput.meter.name = meterName;
                        }

                        energyInput.year = entity.GetAttributeValue<int>("desnz_year1");
                        energyInput.january = entity.GetAttributeValue<decimal?>("desnz_january");
                        energyInput.february = entity.GetAttributeValue<decimal?>("desnz_february");
                        energyInput.march = entity.GetAttributeValue<decimal?>("desnz_march");
                        energyInput.april = entity.GetAttributeValue<decimal?>("desnz_april");
                        energyInput.may = entity.GetAttributeValue<decimal?>("desnz_may");
                        energyInput.june = entity.GetAttributeValue<decimal?>("desnz_june");
                        energyInput.july = entity.GetAttributeValue<decimal?>("desnz_july");
                        energyInput.august = entity.GetAttributeValue<decimal?>("desnz_august");
                        energyInput.september = entity.GetAttributeValue<decimal?>("desnz_september");
                        energyInput.october = entity.GetAttributeValue<decimal?>("desnz_october");
                        energyInput.november = entity.GetAttributeValue<decimal?>("desnz_november");
                        energyInput.december = entity.GetAttributeValue<decimal?>("desnz_december");

                        energyInput.annualTotal = entity.GetAttributeValue<decimal?>("desnz_annualtotal");
                        energyInput.xValue = entity.GetAttributeValue<decimal?>("desnz_xvalue");
                        energyInput.yValue = entity.GetAttributeValue<decimal?>("desnz_yvalue");
                        energyInput.fnX = entity.GetAttributeValue<decimal?>("desnz_fnxn");
                        energyInput.fnY = entity.GetAttributeValue<decimal?>("desnz_fn_yn");
                        energyInput.fractionTFI = entity.GetAttributeValue<decimal?>("desnz_fractionoftotalfuelinput");


                        // Get Fuel Category details
                        if (entity.Attributes.Contains("desnz_fuelcategory") && entity["desnz_fuelcategory"] != null)
                        {
                            EntityReference fuelCatEntityRef = entity["desnz_fuelcategory"] as EntityReference;

                            Guid fuelCatId = fuelCatEntityRef == null ? Guid.Empty : fuelCatEntityRef.Id;
                            string fuelCatName = fuelCatEntityRef?.Name ?? string.Empty;

                            energyInput.fuelCategory = new FuelCategory();
                            energyInput.fuelCategory.id = fuelCatId;
                            energyInput.fuelCategory.name = fuelCatName;
                        }

                        // Get Fuel Category details
                        if (entity.Attributes.Contains("desnz_fuel") && entity["desnz_fuel"] != null)
                        {
                            EntityReference fuelEntityRef = entity["desnz_fuel"] as EntityReference;

                            Guid fuelId = fuelEntityRef == null ? Guid.Empty : fuelEntityRef.Id;
                            string fuelName = fuelEntityRef?.Name ?? string.Empty;

                            energyInput.fuel = new Fuel();
                            energyInput.fuel.id = fuelId;
                            energyInput.fuel.name = fuelName;
                        }

                        entities.Add(energyInput);
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

        public class ReplyEnergyInput
        {
            public Guid? id { get; set; }                           // desnz_fuelinputsid
            public string? tag { get; set; }                        // desnz_name
            public string? tagNumber { get; set; }                     // desnz_tagnum
            public string? tagPrefix { get; set; }                  // desnz_tagprefix
            public string? userTag { get; set; }                    // desnz_tag
            public string? serialNumber { get; set; }               // desnz_serialnumber
            public ReplyInputsOutputsMeter? meter { get; set; }       // desnz_meter
            public FuelCategory? fuelCategory { get; set; }         // desnz_fuelcategory
            public Fuel? fuel { get; set; }                         // desnz_fuel
            public int? year { get; set; }                          // desnz_year1
            public decimal? january { get; set; }                   // desnz_january
            public decimal? february { get; set; }                  // desnz_february
            public decimal? march { get; set; }                     // desnz_march
            public decimal? april { get; set; }                     // desnz_april
            public decimal? may { get; set; }                       // desnz_may
            public decimal? june { get; set; }                      // desnz_june
            public decimal? july { get; set; }                      // desnz_july
            public decimal? august { get; set; }                    // desnz_august
            public decimal? september { get; set; }                 // desnz_september
            public decimal? october { get; set; }                   // desnz_october
            public decimal? november { get; set; }                  // desnz_november
            public decimal? december { get; set; }                  // desnz_december
            public decimal? annualTotal { get; set; }               // desnz_annualtotal
            public decimal? xValue { get; set; }                    // desnz_xvalue
            public decimal? yValue { get; set; }                    // desnz_yvalue
            public decimal? fnX { get; set; }                       // desnz_fnxn
            public decimal? fnY { get; set; }                       // desnz_fn_yn
            public decimal? fractionTFI { get; set; }                // desnz_fractionoftotalfuelinput
            public bool? includeInCalculations { get; set; }         // desnz_calculationused
        }

        
    }
}
