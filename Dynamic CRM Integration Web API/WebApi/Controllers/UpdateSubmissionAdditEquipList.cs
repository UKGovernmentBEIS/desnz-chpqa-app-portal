using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class UpdateSubmissionAdditEquipList : ControllerBase
    {
        private readonly ILogger<UpdateSubmissionAdditEquipList> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public UpdateSubmissionAdditEquipList(ILogger<UpdateSubmissionAdditEquipList> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Update a Submission Additional Equipment List with the given Additional Equipment that is created.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the id of the new Additional Equipment</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("UpdateSubmissionAdditEquipList")]
        [SwaggerOperation(Summary = "Update Submission Additional Equipment List", Description = "Update a Submission Additional Equipment List with the given Additional Equipment List.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult<RequestReturnId>> SubmissionAdditEquipList(RequestUpdateSubmAdditEquipList data)
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

                    Entity resultSubmission = await serviceClient.RetrieveAsync("desnz_submission", new Guid(data.idSubmission), new ColumnSet("desnz_totalkwenormrun", "desnz_totalkwthnormrun"));

                    Entity resultGroup = new Entity("desnz_group", new Guid(data.idGroup));     // get status group

                    RequestReturnId returnId = new RequestReturnId();

                    // ADDITIONAL EQUIPMENT  /////////////////
                    if (data != null)
                    {

                        //Calculations of additional equipment list vars
                        double totalkwenormrun = 0.0;
                        double totalkwthnormrun = 0.0;

                        // get values of equipment for calculations
                        totalkwenormrun = resultSubmission.GetAttributeValue<double>("desnz_totalkwenormrun");
                        totalkwthnormrun = resultSubmission.GetAttributeValue<double>("desnz_totalkwthnormrun");
                        
                        Entity addequip = new("desnz_additionalequipment");
                        addequip["desnz_name"] = data.additEquip.name;
                            
                        addequip["desnz_manufacturer"] = data.additEquip.manufacturer;

                        //give id of unit
                        //addequip["desnz_unit"] = new EntityReference("desnz_unit", addequipData.unit.id ?? Guid.Empty

                        addequip["desnz_model"] = data.additEquip.model;
                        addequip["desnz_numberinstalled"] = data.additEquip.numberInstalled;
                        addequip["desnz_usagefrequency"] = new OptionSetValue(data.additEquip.usageFrequency ?? 0);

                        addequip["desnz_estimatedenergyconsumptionkwe"] = data.additEquip.estimatedEnergyConsumptionKwe;
                        addequip["desnz_estimatedenergyconsumptionkwth"] = data.additEquip.estimatedEnergyConsumptionKwth;

                        addequip["desnz_comments"] = data.additEquip.comments;
                        //relationship
                        addequip["desnz_submission"] = new EntityReference("desnz_submission", resultSubmission.Id);

                        // create additional equipment
                        addequip.Id = await serviceClient.CreateAsync(addequip);

                        returnId.id = addequip.Id;

                        // calculations for submission
                        totalkwenormrun += data.additEquip.estimatedEnergyConsumptionKwe ?? 0.0;
                        totalkwthnormrun += data.additEquip.estimatedEnergyConsumptionKwth ?? 0.0;
                        
                        resultSubmission["desnz_totalkwenormrun"] = totalkwenormrun;
                        resultSubmission["desnz_totalkwthnormrun"] = totalkwthnormrun;

                        resultGroup["desnz_status"] = new OptionSetValue(data.status ?? 0);
                    }

                    //update DB submission entry
                    await serviceClient.UpdateAsync(resultSubmission);
                    await serviceClient.UpdateAsync(resultGroup);

                    _logger.LogInformation("Updated Submission with new Additional Equipment List at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), resultSubmission.Id.ToString());

                    return Ok(returnId.id);
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


        public class RequestUpdateSubmAdditEquipList
        {

            [Required]
            public string? idSubmission { get; set; }
            [Required]
            public string? idGroup { get; set; }
            [Required]
            public int? status { get; set; }
            [Required]
            public RequestAdditEquip? additEquip { get; set; }

        }

        public class RequestAdditEquip
        {
                                   
            [Required]
            public string? name { get; set; }                              // desnz_name

            //public ReplyManufacturer? manufacturerUnit { get; set; }            // desnz_manufacturerunit

            [Required]
            public string? manufacturer { get; set; }                      // desnz_manufacturer

            //public Unit? unit { get; set; }
            [Required]
            public string? model { get; set; }                             // desnz_model

            [Required]
            [Range(0, int.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public int? numberInstalled { get; set; }                      // desnz_numberinstalled

            [Required]
            public int? usageFrequency { get; set; }                       // desnz_usagefrequency    choice list 0 - 2

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? estimatedEnergyConsumptionKwe { get; set; }     // desnz_estimatedenergyconsumptionkwe

            [Range(0, double.MaxValue, ErrorMessage = "The value must be a positive number.")]
            public double? estimatedEnergyConsumptionKwth { set; get; }    // desnz_estimatedenergyconsumptionkwth

            public string? comments { get; set; }                             // desnz_comments

        }



    }
}
