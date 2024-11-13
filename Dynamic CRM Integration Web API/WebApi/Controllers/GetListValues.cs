using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class GetListValues : ControllerBase
    {
        private readonly ILogger<GetListValues> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetListValues(ILogger<GetListValues> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpGet("GetListValues")]
        [SwaggerOperation(Summary = "Get Option List Values", Description = "Get Option List Values")]
        public async Task<ActionResult> GetOptionListValues(string entityLogicalName, string optionSetLogicalName)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {                
                        // Create the request
                        RetrieveAttributeRequest attributeRequest = new RetrieveAttributeRequest
                        {
                            EntityLogicalName = entityLogicalName,
                            LogicalName = optionSetLogicalName
                        };

                        // Execute the request
                        RetrieveAttributeResponse attributeResponse = (RetrieveAttributeResponse)serviceClient.Execute(attributeRequest);

                        // OptionSet metadata
                        PicklistAttributeMetadata metadata = attributeResponse.AttributeMetadata as PicklistAttributeMetadata;

                        if (metadata == null || metadata.OptionSet == null)
                        {
                            return NotFound("OptionSet metadata not found.");
                        }

                    var optionList = metadata.OptionSet.Options
                                   .Where(x => x.Value.HasValue)
                                   .ToDictionary(
                                       x => x.Value.Value,  // Convert Nullable<int> to int
                                       x => x.Label.UserLocalizedLabel?.Label ?? string.Empty);
                  
                    return Ok(optionList);                   
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
    }
}
