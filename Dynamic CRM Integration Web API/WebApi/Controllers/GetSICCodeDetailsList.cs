using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{

    [Route("api")]
    [ApiController]
    public class GetSICCodeDetailsList : ControllerBase
    {
        private readonly ILogger<GetSICCodeDetailsList> logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetSICCodeDetailsList(ILogger<GetSICCodeDetailsList> logger, IServiceClientFactory serviceClientFactory)
        {
            this.logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Get a list of SIC codes based on input SIC Codes list.
        /// </summary>
        /// <response code="200">Returns the SIC Code list</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<ReplySicCode>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetSicCodeDetailsList")]
        [AllowAnonymous]
        [SwaggerOperation(Summary = "Get SICCode list", Description = "Fetches a list with SIC Code entities.")]
        public async Task<ActionResult<List<ReplySicCode>>> FetchSicCodes([FromQuery] string[]? sicCodeList)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    List<ReplySicCode> entities = new List<ReplySicCode>();

                    ReplyMessage reply = new ReplyMessage();

                    if (sicCodeList == null)
                    {
                        reply.message = "data is null";
                        return BadRequest(reply);
                    }

                    if (sicCodeList.Length == 0)
                    {
                        reply.message = "data SIC Code List is null";
                        return BadRequest(reply);
                    }


                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_siccode",
                        ColumnSet = new ColumnSet("desnz_siccodeid", "desnz_name", "desnz_description"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                    {
                        new ConditionExpression("desnz_name", ConditionOperator.In, sicCodeList)
                    }
                        }

                    };

                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    ReplySicCode sicCode = null;

                    //Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {
                        if (sicCode == null || sicCode.id != entity.GetAttributeValue<Guid>("desnz_siccodeid"))
                        {
                            sicCode = new ReplySicCode();
                            sicCode.id = entity.GetAttributeValue<Guid>("desnz_siccodeid");
                            sicCode.name = entity.GetAttributeValue<string>("desnz_name");
                            sicCode.description = entity.GetAttributeValue<string>("desnz_description");
                            entities.Add(sicCode);
                        }

                    }

                    return Ok(entities);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }
    }
}
