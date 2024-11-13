using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;


namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]

    public class GetOutputUnits : ControllerBase
    {

        private readonly ILogger<GetOutputUnits> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetOutputUnits(ILogger<GetOutputUnits> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;

        }

        [HttpGet("GetOutputUnits")]
        [SwaggerOperation(Summary = "Get Output Units", Description = "Retrieves a list of all Output Units.")]
        public async Task<ActionResult<List<OutputUnit>>> OutputUnits()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<OutputUnit> entities = new List<OutputUnit>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_outputunit", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_outputunitid", "desnz_name"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                                {
                                    new ConditionExpression("statecode", ConditionOperator.Equal, 0 )
                                }
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    OutputUnit outputUnit = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {
                        outputUnit = new OutputUnit();

                        outputUnit.id = entity.GetAttributeValue<Guid>("desnz_outputunitid");
                        outputUnit.name = entity.GetAttributeValue<string>("desnz_name");
                           
                        entities.Add(outputUnit);
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