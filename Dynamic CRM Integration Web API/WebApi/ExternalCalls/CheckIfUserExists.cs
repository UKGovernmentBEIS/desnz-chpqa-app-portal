using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestSharp;
using Swashbuckle.AspNetCore.Annotations;
using System.Text.Json;
using WebApi.Contracts;
using WebApi.Services;
namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class CheckIfUserExists : ControllerBase
    {
        private readonly ILogger<CheckIfUserExists> _logger;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _realm;
        private readonly string _keycloakBaseUrl;
        private readonly IServiceClientFactory _serviceClientFactory;
        public CheckIfUserExists(IConfiguration configuration, ILogger<CheckIfUserExists> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _clientId = configuration["KeycloakAudience"];
            _clientSecret = Environment.GetEnvironmentVariable("clientSecret");
            _realm = configuration["KeycloakRealm"];
            _keycloakBaseUrl = configuration["keycloakBaseUrl"];
            _serviceClientFactory = serviceClientFactory;
    }

        [HttpGet("CheckIfUserExists")]
        [SwaggerOperation(Summary = "Check If User Exists", Description = "Check If User Exists")]
        [AllowAnonymous]
        public async Task<ActionResult> CheckIfUserEmailExists(string email)
        {
            try
            {
                var response = await CheckUser(_keycloakBaseUrl, _realm, await GetAccessToken(_keycloakBaseUrl, _realm, _clientId, _clientSecret), email);

                if (response.IsSuccessStatusCode)
                {
                    if (response.Content == "1")
                    {
                        ReplyMessage reply = new ReplyMessage();
                        reply.message = "Email is already registered";
                        return Ok(reply);
                    }
                    else
                    {
                        ReplyMessage reply = new ReplyMessage();
                        reply.message = "OK";
                        return Ok(reply);
                    }                  
                }
                else
                {
                    ReplyMessage reply = new ReplyMessage();
                    reply.message = "Internal Server Error Occurred";
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

        static async Task<string> GetAccessToken(string baseUrl, string realm, string clientId, string clientSecret)
        {
            var client = new RestClient($"{baseUrl}/realms/{realm}/protocol/openid-connect/token");
            var request = new RestRequest($"{baseUrl}/realms/{realm}/protocol/openid-connect/token", Method.Post);
            request.AddParameter("client_id", clientId);
            request.AddParameter("client_secret", clientSecret);
            request.AddParameter("grant_type", "client_credentials");

            var response = client.Execute<TokenResponse>(request);
            if (response.IsSuccessful)
            {
                var tokenResponse = JsonSerializer.Deserialize<JsonElement>(response.Content);
                if (tokenResponse.TryGetProperty("access_token", out var accessToken))
                {
                    return accessToken.GetString();
                }
                else return null;
            }
            else
            {
                return "Error: " + response.ErrorMessage;
            }
        }

        static async Task<RestResponse> CheckUser(string baseUrl, string realm, string accessToken, string email)
        {
            var client = new RestClient($"{baseUrl}/admin/realms/{realm}/users/count?email="  + email);
            var request = new RestRequest($"{baseUrl}/admin/realms/{realm}/users/count?email=" + email, Method.Get);
            request.AddHeader("Authorization", $"Bearer {accessToken}");
            request.AddHeader("Content-Type", "application/json");

            // Execute the request and return the response
            return await client.ExecuteAsync(request);
        }

        public class TokenResponse
        {
            public string AccessToken { get; set; }
            public string RefreshToken { get; set; }
            public int ExpiresIn { get; set; }
            public string TokenType { get; set; }
        }
    }
}

