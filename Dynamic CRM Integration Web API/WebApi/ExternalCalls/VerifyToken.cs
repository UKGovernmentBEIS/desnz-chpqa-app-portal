using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class VerifyToken : ControllerBase
    {
        private readonly ILogger<VerifyToken> _logger;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly string _sendGridApiKey;
        private readonly string _sendGridFromEmail;
        private readonly IServiceClientFactory _serviceClientFactory;
        public VerifyToken(IConfiguration configuration, ILogger<VerifyToken> logger, IJwtTokenService jwtTokenService, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _jwtTokenService = jwtTokenService;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpPost("VerifyToken")]
        [SwaggerOperation(Summary = "Verify Token", Description = "Verify Token")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyRegisterToken(string token, string email)
        {
            try
            {
                string VerifiedEmail = _jwtTokenService.VerifyToken(token, "user_registration", email);
                ReplyMessage reply = new ReplyMessage();

                if (VerifiedEmail == email)
                {
                    using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                    {
                        QueryExpression checkquery = new QueryExpression
                        {
                            EntityName = "desnz_verifiedemails", // Specify the name of the parent entity
                            ColumnSet = new ColumnSet("desnz_verifiedemailsid"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                            {
                              new ConditionExpression("desnz_email", ConditionOperator.Equal, email.Trim().ToLower())
                            }
                            },
                            TopCount = 1 // Limit the result to only one record
                        };
                        EntityCollection checkresults = serviceClient.RetrieveMultiple(checkquery);

                        if (checkresults.Entities.Count == 0)
                        {
                            Entity verifiedemail = new Entity("desnz_verifiedemails");

                            verifiedemail["desnz_email"] = email.Trim().ToLower();
                          
                            await serviceClient.CreateAsync(verifiedemail);
                        }
                    }
                    reply.message = "Verified";
                    return Ok(reply);
                }
                else
                {
                    reply.message = "Not Verified";
                    return StatusCode(StatusCodes.Status401Unauthorized, reply);

                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex);
                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";

                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }
    }
}
