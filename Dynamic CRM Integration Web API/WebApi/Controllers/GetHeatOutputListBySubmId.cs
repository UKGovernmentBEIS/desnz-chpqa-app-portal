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

    public class GetHeatOutputListBySubmId : ControllerBase
    {
        private readonly ILogger<GetHeatOutputListBySubmId> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetHeatOutputListBySubmId(ILogger<GetHeatOutputListBySubmId> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves Details of Power Output List By Submission Id.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Todo
        ///     {
        ///         GetHeatOutputListBySubmId?id=3b8a8580-3835-ef11-8409-6045bddf4514
        ///     }
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of Power Outputs with their details by the given id of a Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetHeatOutputListBySubmId")]
        [SwaggerOperation(Summary = "Get Heat Output List By Submission Id", Description = "Retrieves Details of Heat Output List By Submission Id.")]
        [ProducesResponseType(typeof(List<ReplyHeatOutput>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<List<ReplyHeatOutput>>> HeatOutputListBySubmId(Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {         

                    List<ReplyHeatOutput> entities = new List<ReplyHeatOutput>();

                    // Energy Input
                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_heatoutput", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_heatoutputid", "desnz_name", "desnz_tagnum", "desnz_tagprefix", "desnz_tag", "desnz_serialnumber",
                            "desnz_arethereanychpqacalculations", "desnz_meter", "desnz_metertype", "desnz_type", "desnz_year", "desnz_january",
                            "desnz_february", "desnz_march", "desnz_april", "desnz_may", "desnz_june", "desnz_july", "desnz_august", "desnz_september",
                            "desnz_october", "desnz_november", "desnz_december", "desnz_annualtotal"),
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

                        ReplyHeatOutput heatOutput = new ReplyHeatOutput();

                        heatOutput.id = entity.GetAttributeValue<Guid>("desnz_heatoutputid");
                        heatOutput.tag = entity.GetAttributeValue<string>("desnz_name");
                        heatOutput.tagNumber = entity.GetAttributeValue<string>("desnz_tagnum");
                        heatOutput.tagPrefix = entity.GetAttributeValue<string>("desnz_tagprefix");
                        heatOutput.userTag = entity.GetAttributeValue<string>("desnz_tag");
                        heatOutput.serialNumber = entity.GetAttributeValue<string>("desnz_serialnumber");
                        heatOutput.includeInCalculations = entity.GetAttributeValue<bool?>("desnz_arethereanychpqacalculations");

                        // Get meter id
                        if (entity.Attributes.Contains("desnz_meter") && entity["desnz_meter"] != null)
                        {
                            EntityReference meterEntityRef = entity["desnz_meter"] as EntityReference;

                            Guid meterId = meterEntityRef == null ? Guid.Empty : meterEntityRef.Id;
                            string meterName = meterEntityRef?.Name ?? string.Empty;

                            heatOutput.meter = new ReplyHeatOutputMeter();
                            heatOutput.meter.id = meterId;
                            heatOutput.meter.name = meterName;
                        }
                        // Get meter type id (equipment sub type)
                        if (entity.Attributes.Contains("desnz_metertype") && entity["desnz_metertype"] != null)
                        {
                            EntityReference meterTypeEntityRef = entity["desnz_metertype"] as EntityReference;

                            Guid meterTypeId = meterTypeEntityRef == null ? Guid.Empty : meterTypeEntityRef.Id;
                            string meterTypeName = meterTypeEntityRef?.Name ?? string.Empty;

                            heatOutput.meterType = new ReplyEquipmentSubType();
                            heatOutput.meterType.id = meterTypeId;
                            heatOutput.meterType.name = meterTypeName;
                        }

                        if (entity.Attributes.ContainsKey("desnz_type") && entity["desnz_type"] is OptionSetValue optionSetValueType)
                        {
                            heatOutput.heatType = optionSetValueType.Value;
                        }

                        heatOutput.year = entity.GetAttributeValue<int>("desnz_year");
                        heatOutput.january = entity.GetAttributeValue<decimal?>("desnz_january");
                        heatOutput.february = entity.GetAttributeValue<decimal?>("desnz_february");
                        heatOutput.march = entity.GetAttributeValue<decimal?>("desnz_march");
                        heatOutput.april = entity.GetAttributeValue<decimal?>("desnz_april");
                        heatOutput.may = entity.GetAttributeValue<decimal?>("desnz_may");
                        heatOutput.june = entity.GetAttributeValue<decimal?>("desnz_june");
                        heatOutput.july = entity.GetAttributeValue<decimal?>("desnz_july");
                        heatOutput.august = entity.GetAttributeValue<decimal?>("desnz_august");
                        heatOutput.september = entity.GetAttributeValue<decimal?>("desnz_september");
                        heatOutput.october = entity.GetAttributeValue<decimal?>("desnz_october");
                        heatOutput.november = entity.GetAttributeValue<decimal?>("desnz_november");
                        heatOutput.december = entity.GetAttributeValue<decimal?>("desnz_december");

                        heatOutput.annualTotal = entity.GetAttributeValue<decimal?>("desnz_annualtotal");

                        entities.Add(heatOutput);
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

        public class ReplyHeatOutput
        {
            public Guid? id { get; set; }                           // ddesnz_heatoutputid
            public string? tag { get; set; }                        // desnz_name
            public string? tagNumber { get; set; }                  // desnz_tagnum
            public string? tagPrefix { get; set; }                  // desnz_tagprefix
            public string? userTag { get; set; }                    // desnz_tag
            public string? serialNumber { get; set; }               // desnz_serialnumber
            public bool? includeInCalculations { get; set; }        // desnz_arethereanychpqacalculations
            public int? heatType { get; set; }                      // desnz_type
            public ReplyEquipmentSubType meterType { get; set; }    // desnz_metertype
            public ReplyHeatOutputMeter meter { get; set; }         // desnz_meter
            public int? year { get; set; }                          // desnz_year
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
        }

        public class ReplyHeatOutputMeter
        {
            public Guid? id { get; set; }                          // desnz_fuelinputsid
            public string? name { get; set; }                      // desnz_name
        }


    }
}

