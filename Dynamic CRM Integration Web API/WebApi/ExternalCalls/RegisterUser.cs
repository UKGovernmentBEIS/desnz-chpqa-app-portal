using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using RestSharp;
using Swashbuckle.AspNetCore.Annotations;
using System.Text.Json;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;
namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class RegisterUser : ControllerBase
    {
        private readonly ILogger<RegisterUser> _logger;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _realm;
        private readonly string _keycloakBaseUrl;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly IConfiguration _configuration;

        public RegisterUser(IConfiguration configuration, ILogger<RegisterUser> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _clientId = configuration["KeycloakAudience"];
            _clientSecret = Environment.GetEnvironmentVariable("clientSecret");  
            _realm = configuration["KeycloakRealm"];
            _keycloakBaseUrl = configuration["keycloakBaseUrl"];
            _serviceClientFactory = serviceClientFactory;
            _configuration = configuration;
        }

        [HttpPost("RegisterUser")]
        [SwaggerOperation(Summary = "Register User", Description = "Register User")]
        [AllowAnonymous]
        public async Task<ActionResult> PostCase(RegisterRequest data)
        {
            try
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
                              new ConditionExpression("desnz_email", ConditionOperator.Equal,  data?.email.Trim().ToLower())
                            }
                        },
                        TopCount = 1 // Limit the result to only one record
                    };
                    EntityCollection checkresults = serviceClient.RetrieveMultiple(checkquery);

                    if (checkresults.Entities.Count > 0)
                    {
                        // Create User
                        var user = new
                        {
                            username = data.username,
                            email = data.email.Trim().ToLower(),
                            firstName = data.firstName,
                            lastName = data.lastName,
                            enabled = true,
                            emailVerified = true,
                            credentials = new[]
                            {
                                new
                                {
                                type = "password",
                                value =data.password,
                                temporary = false
                                }
                            }
                        };


                        var response = await CreateUser(_keycloakBaseUrl, _realm, await GetAccessToken(_keycloakBaseUrl, _realm, _clientId, _clientSecret), user);

                        if (response.IsSuccessStatusCode)
                        {
                            Guid ResponsiblePersonOrganizationid = Guid.Empty;

                            if (data.organisation != null)
                            {
                                QueryExpression organisationquery = new QueryExpression
                                {
                                    EntityName = "account", // Specify the name of the parent entity
                                    ColumnSet = new ColumnSet("accountid"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                {
                                    new ConditionExpression("name", ConditionOperator.Equal,  data?.organisation?.name)
                                }
                                    },
                                    TopCount = 1 // Limit the result to only one record
                                };

                                EntityCollection organisationresults = serviceClient.RetrieveMultiple(organisationquery);

                                if (organisationresults.Entities.Count > 0)
                                {
                                    ResponsiblePersonOrganizationid = organisationresults.Entities.FirstOrDefault().GetAttributeValue<Guid>("accountid");
                                    Entity ResponsiblePersonOrganization = new Entity("account", ResponsiblePersonOrganizationid);
                                    ResponsiblePersonOrganization["desnz_registrationnumber"] = data?.organisation?.registrationNumber;
                                    ResponsiblePersonOrganization["address1_name"] = data?.organisation?.address1;
                                    ResponsiblePersonOrganization["address2_name"] = data?.organisation?.address2;
                                    ResponsiblePersonOrganization["address1_city"] = data?.organisation?.town;
                                    ResponsiblePersonOrganization["address1_county"] = data?.organisation?.county;
                                    ResponsiblePersonOrganization["address1_postalcode"] = data?.organisation?.postcode;
                                    await serviceClient.UpdateAsync(ResponsiblePersonOrganization);
                                }
                                else
                                {
                                    // create organisation for responsible person
                                    Entity ResponsiblePersonOrganization = new("account");
                                    ResponsiblePersonOrganization["name"] = data?.organisation?.name;
                                    ResponsiblePersonOrganization["desnz_registrationnumber"] = data?.organisation?.registrationNumber;
                                    ResponsiblePersonOrganization["address1_name"] = data?.organisation?.address1;
                                    ResponsiblePersonOrganization["address2_name"] = data?.organisation?.address2;
                                    ResponsiblePersonOrganization["address1_city"] = data?.organisation?.town;
                                    ResponsiblePersonOrganization["address1_county"] = data?.organisation?.county;
                                    ResponsiblePersonOrganization["address1_postalcode"] = data?.organisation?.postcode;
                                    ResponsiblePersonOrganization.Id = await serviceClient.CreateAsync(ResponsiblePersonOrganization);
                                    ResponsiblePersonOrganizationid = ResponsiblePersonOrganization.Id;
                                }
                            }

                            QueryExpression query = new QueryExpression
                            {
                                EntityName = "contact", // Specify the name of the parent entity
                                ColumnSet = new ColumnSet("contactid"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                            {
                              new ConditionExpression("emailaddress1", ConditionOperator.Equal,  data?.email.Trim().ToLower())
                            }
                                },
                                TopCount = 1 // Limit the result to only one record
                            };

                            EntityCollection results = serviceClient.RetrieveMultiple(query);

                            if (results.Entities.Count > 0)
                            {
                                // update responsible person
                                Entity ResponsiblePerson = new("contact", results.Entities.FirstOrDefault().GetAttributeValue<Guid>("contactid"));
                                ResponsiblePerson["firstname"] = data?.firstName;
                                ResponsiblePerson["lastname"] = data?.lastName;
                                ResponsiblePerson["desnz_username"] = data?.username;
                                ResponsiblePerson["desnz_usertype"] = new OptionSetValue((int)Person.UserType.ResponsiblePerson);
                                ResponsiblePerson["jobtitle"] = data?.jobTitle;
                                ResponsiblePerson["desnz_consultant"] = data?.consultant;
                                ResponsiblePerson["address1_telephone1"] = data?.telephone1;
                                ResponsiblePerson["address1_telephone2"] = data?.telephone2;

                                if (data.organisation != null)
                                {
                                    ResponsiblePerson["parentcustomerid"] = new EntityReference("account", ResponsiblePersonOrganizationid);
                                }
                                  await serviceClient.UpdateAsync(ResponsiblePerson);
                            }
                            else
                            {
                                // create responsible person
                                Entity ResponsiblePerson = new("contact");
                                ResponsiblePerson["firstname"] = data?.firstName;
                                ResponsiblePerson["lastname"] = data?.lastName;
                                ResponsiblePerson["desnz_username"] = data?.username;
                                ResponsiblePerson["emailaddress1"] = data?.email.Trim().ToLower();
                                ResponsiblePerson["desnz_usertype"] = new OptionSetValue((int)Person.UserType.ResponsiblePerson);
                                ResponsiblePerson["jobtitle"] = data?.jobTitle;
                                ResponsiblePerson["desnz_consultant"] = data?.consultant;
                                ResponsiblePerson["address1_telephone1"] = data?.telephone1;
                                ResponsiblePerson["address1_telephone2"] = data?.telephone2;

                                if (data.organisation != null)
                                {
                                    ResponsiblePerson["parentcustomerid"] = new EntityReference("account", ResponsiblePersonOrganizationid);
                                }
                                ResponsiblePerson.Id = await serviceClient.CreateAsync(ResponsiblePerson);
                            }

                            //Send Email
                            SendRegiEmail task = new SendRegiEmail(_configuration);

                            string fullname = data.firstName + " " + data.lastName;

                            await task.SendRegEmail(fullname, data.email);

                            return Ok("User Created Successfully");
                        }
                        else
                        {
                            CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                            await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, response.ErrorMessage + " " + response.Content);
                            ReplyMessage reply = new ReplyMessage();
                            reply.message = "Internal Server Error Occurred";
                            return StatusCode(StatusCodes.Status500InternalServerError, reply);
                        }
                    }
                    else
                    {
                        CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                        await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, "Email not Verified " + data?.email.Trim().ToLower());
                        ReplyMessage reply = new ReplyMessage();
                        reply.message = "Internal Server Error Occurred";
                        return StatusCode(StatusCodes.Status500InternalServerError, reply);
                    }
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

        static async Task<RestResponse> CreateUser(string baseUrl, string realm, string accessToken, object user)
        {
            var client = new RestClient($"{baseUrl}/admin/realms/{realm}/users");
            var request = new RestRequest($"{baseUrl}/admin/realms/{realm}/users", Method.Post);
            request.AddHeader("Authorization", $"Bearer {accessToken}");
            request.AddHeader("Content-Type", "application/json");

            // Serialize the user object to JSON
            string userJson = JsonSerializer.Serialize(user);

            // Set the request body to the serialized JSON
            request.AddParameter("application/json", user, ParameterType.RequestBody);

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

        public class RegisterRequest
        {
            public string? username { get; set; }
            public string? firstName { get; set; }          // firstname
            public string? lastName { get; set; }           // lastname
            public string? password { get; set; }           // password 
            public string? email { get; set; }              // emailaddress1
            public string? jobTitle { get; set; }           // jobtitle          
            public bool? consultant { get; set; }           // desnz_consultant          
            public string? telephone1 { get; set; }         // address1_telephone1
            public string? telephone2 { get; set; }         // address1_telephone2
            public Organisation? organisation { get; set; }         // parentcustomerid

        }
    }
}

