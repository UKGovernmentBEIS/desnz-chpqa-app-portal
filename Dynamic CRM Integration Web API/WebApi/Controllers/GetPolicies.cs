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

    public class GetPolicies : ControllerBase
    {
        private readonly ILogger<GetPolicies> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
     
        public GetPolicies(ILogger<GetPolicies> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;        
        }

        [HttpGet("GetSchemesPolicies")]
        [SwaggerOperation(Summary = "Get all Policies", Description = "Retrieves a list of all Schemes Policies.")]
        public async Task<ActionResult<Policy>> GetSchemesPolicies()
        {
            try
            {   
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {                  
                    //
                    if (!await AuthorizationService.ValidateUserRole(User, serviceClient)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //

                    List<Policy> entities = new List<Policy>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_schemepolicy",
                        ColumnSet = new ColumnSet("desnz_schemepolicyid", "desnz_id", "desnz_name", "desnz_type", "desnz_latest")
                    };
                    EntityCollection policyresults = serviceClient.RetrieveMultiple(query);

                  
                    foreach (Entity entity in policyresults.Entities)
                    {
                        Policy myEntity = new Policy();
                        myEntity.id = entity.GetAttributeValue<Guid>("desnz_schemepolicyid");
                        myEntity.name = entity.GetAttributeValue<string?>("desnz_name");
                        myEntity.type = entity.GetAttributeValue<int?>("desnz_type");
                        myEntity.latest = entity.GetAttributeValue<bool?>("desnz_latest");
                        entities.Add(myEntity);
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
