using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/secure")]
    [ApiController]
    public class DeleteMeter : ControllerBase
    {
        private readonly ILogger<DeleteMeter> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public DeleteMeter(ILogger<DeleteMeter> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpDelete("DeleteMeter")]
        public async Task<ActionResult<RequestDeleteMeter>> DeleteMeter_(RequestDeleteMeter data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyMessage reply = new ReplyMessage();

                    
                    if (!await SubmissionEditabilityService.CanSubmissionBeEdited(data.submissionId, serviceClient, _logger))
                    {
                        reply.message = "Submission cannot be edited";
                        return BadRequest(reply);
                    }
                    //

                    QueryExpression meterQuery = new QueryExpression
                    {
                        EntityName = "desnz_fuelmeters", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_fuelmetersid", "desnz_measuretype"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_fuelmetersid", ConditionOperator.Equal,data.MeterId)
                            }
                        }
                    };

                    EntityCollection meterResults = await serviceClient.RetrieveMultipleAsync(meterQuery);

                    if (meterResults.Entities.Count > 0)
                    {
                        if (meterResults.Entities[0].GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.EnergyInput)
                        {
                            // energy input
                            QueryExpression relatedquery = new QueryExpression
                            {
                                EntityName = "desnz_fuelinputs", // Specify the name of the parent entity
                                ColumnSet = new ColumnSet("desnz_fuelinputsid"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("desnz_meter", ConditionOperator.Equal, data.MeterId )
                                    }
                                }
                            };

                            EntityCollection relatedfuelinputsresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                            if (relatedfuelinputsresults.Entities.Count > 0)
                            {
                                await serviceClient.DeleteAsync("desnz_fuelinputs", relatedfuelinputsresults.Entities[0].GetAttributeValue<Guid>("desnz_fuelinputsid"));

                                await UpdEnergyInputsXYCalc.CalculateAsync(data.submissionId, serviceClient);

                                await UpdEnergyInputsCalc.CalculateAsync(data.submissionId, serviceClient);

                                await UpdSectionStatusesFun.ChangeSectionStatuses(data.submissionId, (int)SubmissionGroups.GroupType.ProvideEnergyInputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                            }

                        }
                        else if (meterResults.Entities[0].GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.PowerOutput)
                        {
                            // power output
                            QueryExpression relatedquery = new QueryExpression
                            {
                                EntityName = "desnz_poweroutputs", // Specify the name of the parent entity
                                ColumnSet = new ColumnSet("desnz_poweroutputsid"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("desnz_meter", ConditionOperator.Equal,data.MeterId )
                                    }
                                }
                            };

                            EntityCollection relatedpoweroutputsresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                            if (relatedpoweroutputsresults.Entities.Count > 0)
                            {
                                await serviceClient.DeleteAsync("desnz_poweroutputs", relatedpoweroutputsresults.Entities[0].GetAttributeValue<Guid>("desnz_poweroutputsid"));

                                await UpdPowerOutputsCalc.CalculateAsync(data.submissionId, serviceClient);

                                await UpdSectionStatusesFun.ChangeSectionStatuses(data.submissionId, (int)SubmissionGroups.GroupType.ProvidePowerOutputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                            }
                        }
                        else if (meterResults.Entities[0].GetAttributeValue<OptionSetValue>("desnz_measuretype").Value == (int)Meter.MeasureType.HeatOutput)
                        {
                            // heat output
                            QueryExpression relatedquery = new QueryExpression
                            {
                                EntityName = "desnz_heatoutput", // Specify the name of the parent entity
                                ColumnSet = new ColumnSet("desnz_heatoutputid"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("desnz_meter", ConditionOperator.Equal,data.MeterId )
                                    }
                                }
                            };

                            EntityCollection relatedheatoutputresults = await serviceClient.RetrieveMultipleAsync(relatedquery);

                            if (relatedheatoutputresults.Entities.Count > 0)
                            {
                                await serviceClient.DeleteAsync("desnz_heatoutput", relatedheatoutputresults.Entities[0].GetAttributeValue<Guid>("desnz_heatoutputid"));

                                await UpdHeatOutputsCalc.CalculateAsync(data.submissionId, serviceClient);

                                await UpdSectionStatusesFun.ChangeSectionStatuses(data.submissionId, (int)SubmissionGroups.GroupType.ProvideHeatOutputs, (int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, serviceClient, _logger);
                            }
                        }
                    }

                    await serviceClient.DeleteAsync("desnz_fuelmeters", data.MeterId);


                    await UpdSectionStatusesFun.ChangeSectionStatuses(data.submissionId, (int)SubmissionGroups.GroupType.AddMeterDetails, (int)SubmissionGroups.GroupCategory.SchemeDetails, serviceClient, _logger);

                    await UpdSubmCalcEfficAndQIFun.CalculateAsync(data.submissionId, serviceClient);

                    return Ok(data.MeterId);
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

        public class RequestDeleteMeter
        {
            [Required]
            public Guid submissionId { get; set; }

            [Required]
            public Guid MeterId { get; set; }

        }
    }
}
