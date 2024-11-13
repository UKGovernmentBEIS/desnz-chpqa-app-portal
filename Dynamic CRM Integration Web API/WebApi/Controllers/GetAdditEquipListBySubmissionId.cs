using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]

    public class GetAdditEquipListBySubmissionId : ControllerBase
    {
        private readonly ILogger<GetAdditEquipListBySubmissionId> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetAdditEquipListBySubmissionId(ILogger<GetAdditEquipListBySubmissionId> logger, IServiceClientFactory serviceClientFactory)
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
        [ProducesResponseType(typeof(List<ReplyAdditEquip>), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 500)]

        [HttpGet("GetAdditEquipListBySubmissionId")]
        [SwaggerOperation(Summary = "Get Additional Equipment List By Submission Id", Description = "Retrieves Details of Additional Equipment List By Submission Id.")]
        public async Task<ActionResult<List<ReplyAdditEquip>>> AdditionalEquipmentListBySubmissionId(Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
         

                    List<ReplyAdditEquip> entities = new List<ReplyAdditEquip>();

                    // AdditionalEquipment

                    QueryExpression relatedquery = new QueryExpression
                    {
                        EntityName = "desnz_additionalequipment", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_additionalequipmentid", "desnz_name", "desnz_manufacturer", "desnz_model", "desnz_numberinstalled",
                            "desnz_usagefrequency", "desnz_estimatedenergyconsumptionkwe", "desnz_estimatedenergyconsumptionkwth", "desnz_comments"),
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

                        ReplyAdditEquip additEquip = new ReplyAdditEquip();

                        additEquip.id = entity.GetAttributeValue<Guid>("desnz_additionalequipmentid");
                        additEquip.name = entity.GetAttributeValue<string>("desnz_name");
                        additEquip.manufacturer = entity.GetAttributeValue<string>("desnz_manufacturer");
                        additEquip.model = entity.GetAttributeValue<string>("desnz_model");
                        additEquip.numberInstalled = entity.GetAttributeValue<int>("desnz_numberinstalled");
                        
                        if (entity.Attributes.ContainsKey("desnz_usagefrequency") && entity["desnz_usagefrequency"] is OptionSetValue optionSetValueSubmissionFormType)
                        {
                            additEquip.usageFrequency = optionSetValueSubmissionFormType.Value;
                        }

                        additEquip.estimatedEnergyConsumptionKwe = entity.GetAttributeValue<double>("desnz_estimatedenergyconsumptionkwe");
                        additEquip.estimatedEnergyConsumptionKwth = entity.GetAttributeValue<double>("desnz_estimatedenergyconsumptionkwth");
                        
                        additEquip.comments = entity.GetAttributeValue<string>("desnz_comments");

                        entities.Add(additEquip);

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

        public class ReplyAdditEquip
        {
            public Guid id { get; set; }
            public string? name { get; set; }                              // desnz_name

            public string? manufacturer { get; set; }                      // desnz_manufacturer

            public string? model { get; set; }                             // desnz_model

            public int? numberInstalled { get; set; }                      // desnz_numberinstalled


            public int? usageFrequency { get; set; }                       // desnz_usagefrequency    choice list 0 - 2

            public double? estimatedEnergyConsumptionKwe { get; set; }     // desnz_estimatedenergyconsumptionkwe

            public double? estimatedEnergyConsumptionKwth { set; get; }    // desnz_estimatedenergyconsumptionkwth

            public string? comments { get; set; }                             // desnz_comments



        }
    }
}
