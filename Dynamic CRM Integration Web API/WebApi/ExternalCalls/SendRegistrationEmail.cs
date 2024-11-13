using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Notify.Client;
using Notify.Models;
using Notify.Models.Responses;
//using SendGrid;
//using SendGrid.Helpers.Mail;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class SendRegistrationEmail : ControllerBase
    {
        private readonly ILogger<SendRegistrationEmail> _logger;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly string _GovUKNotifyApiKey;
        private readonly string _RegistrationEmailTemplate;
        private readonly string _sendLoginPageFromEmail;
        long expirationMinutes = 30;
        private readonly IServiceClientFactory _serviceClientFactory;
        public SendRegistrationEmail(IConfiguration configuration, ILogger<SendRegistrationEmail> logger, IJwtTokenService jwtTokenService, IServiceClientFactory serviceClientFactory)
        {
            _GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"]; //Environment.GetEnvironmentVariable("SendGridApiKey");
            _RegistrationEmailTemplate = configuration["GovUKRegistrationEmailTemplate"];
            _sendLoginPageFromEmail = configuration["SendLoginPageFromEmail"];
            _logger = logger;
            _jwtTokenService = jwtTokenService;
            _serviceClientFactory = serviceClientFactory;
        }

        [HttpPost("SendRegEmail")]
        [SwaggerOperation(Summary = "Send Registration Email", Description = "Send Registration Email")]
        [AllowAnonymous]
        public async Task<IActionResult> SendRegEmail( EmailRegRequest request)
        {
            try
            {
                // Define the placeholder to be replaced
                string placeholder = "dynamicLink";

                // The dynamic value you want to replace
                string linkPlusToken = _sendLoginPageFromEmail + "?email=" + request.To + "&token=" + generateToken(request.To);

               var client = new NotificationClient(_GovUKNotifyApiKey);

                var response = client.SendEmail(
                    emailAddress: request.To,
                    //templateId: "38ab553e-9dd5-4f8f-88e1-bd2374d829e1"
                    templateId: _RegistrationEmailTemplate,
                    new Dictionary<string, dynamic> { { placeholder, linkPlusToken } }
                );
                ReplyMessage reply = new ReplyMessage();

                //if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
                if(response.id is not null)
                {
                    reply.message = "Email sent successfully.";

                    return Ok(reply);
                }
                else
                {
                    reply.message = "Failed to send email.";
                    return StatusCode(StatusCodes.Status500InternalServerError, reply);

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

        protected string generateToken(String email)
        {
            String token = _jwtTokenService.GenerateToken("user_registration", "user_email", email, expirationMinutes);
            return token;
        }
        public class EmailRegRequest
        {
            public string To { get; set; }
        }
    }
}
