using DocumentFormat.OpenXml.Vml.Office;
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

    public class GetContactByEmail : ControllerBase
    {
        private readonly ILogger<GetContactByEmail> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetContactByEmail(ILogger<GetContactByEmail> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Retrieves a Contact with the given Email.
        /// </summary>
        /// <response code="200">Returns the Contact / Person details</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplyPerson), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetContactByEmail")]
        [SwaggerOperation(Summary = "Get a Contact by Email", Description = "Retrieves a Contact with the given Email.")]
        public async Task<ActionResult<ReplyPerson>> ContactByEmail()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplyPerson person = new ReplyPerson();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "contact", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("contactid", "firstname", "lastname", "emailaddress1", "desnz_usertype", 
                            "jobtitle", "desnz_consultant", "address1_telephone1", "address1_telephone2"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("emailaddress1", ConditionOperator.Equal, User.Claims.First(x => x.Type == "preferred_username").Value),
                                new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                            }
                        },
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "account", // Parent entity
                                LinkFromAttributeName = "parentcustomerid", // Parent entity attribute
                                LinkToEntityName = "account", // Related entity
                                LinkToAttributeName = "accountid", // Related entity attribute
                                Columns =  new ColumnSet("accountid", "name", "desnz_registrationnumber", "address1_name",
                                    "address2_name", "address1_city", "address1_county", "address1_postalcode"),
                                EntityAlias = "Organisation", // Alias for the related entity                      
                            }
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    if (results.Entities.Count > 0)
                    {
                        AliasedValue OrganisationId = (AliasedValue)results.Entities[0]["Organisation.accountid"];
                        AliasedValue OrganisationName = (AliasedValue)results.Entities[0]["Organisation.name"];
                        AliasedValue OrganisationRegNumber = null;
                        AliasedValue OrganisationAddress1 = null;
                        AliasedValue OrganisationAddress2 = null;
                        AliasedValue OrganisationTown = null;
                        AliasedValue OrganisationCounty = null;
                        AliasedValue OrganisationPostcode = null;

                        if (results.Entities[0].Attributes.ContainsKey("Organisation.desnz_registrationnumber"))
                        {
                            OrganisationRegNumber = (AliasedValue)results.Entities[0]["Organisation.desnz_registrationnumber"];
                        }
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.address1_name"))
                        {
                            OrganisationAddress1 = (AliasedValue)results.Entities[0]["Organisation.address1_name"];
                        }
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.address2_name"))
                        {
                            OrganisationAddress2 = (AliasedValue)results.Entities[0]["Organisation.address2_name"];
                        }
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.address1_city"))
                        {
                            OrganisationTown = (AliasedValue)results.Entities[0]["Organisation.address1_city"];
                        }
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.address1_county"))
                        {
                            OrganisationCounty = (AliasedValue)results.Entities[0]["Organisation.address1_county"];
                        }
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.address1_postalcode"))
                        {
                            OrganisationPostcode = (AliasedValue)results.Entities[0]["Organisation.address1_postalcode"];
                        }
                        
                        person.id = results.Entities[0].GetAttributeValue<Guid>("contactid");
                        person.firstName = results.Entities[0].GetAttributeValue<string>("firstname");
                        person.lastName = results.Entities[0].GetAttributeValue<string>("lastname");
                        person.email = results.Entities[0].GetAttributeValue<string>("emailaddress1");

                        if (results.Entities[0].Attributes.ContainsKey("desnz_usertype") && results.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                        {
                            person.userType = optionSetValue.Value;
                        }

                        person.jobTitle = results.Entities[0].GetAttributeValue<string>("jobtitle");
                        person.consultant = results.Entities[0].GetAttributeValue<bool?>("desnz_consultant");

                        person.telephone1 = results.Entities[0].GetAttributeValue<string>("address1_telephone1");
                        person.telephone2 = results.Entities[0].GetAttributeValue<string>("address1_telephone2");

                        person.organisation = new ReplyOrganisation();
                        person.organisation.id = OrganisationId == null ? Guid.Empty : (Guid)OrganisationId.Value;
                        person.organisation.name = OrganisationName?.Value.ToString() ?? string.Empty;
                        person.organisation.registrationNumber = OrganisationRegNumber?.Value.ToString() ?? string.Empty;
                        person.organisation.address1 = OrganisationAddress1?.Value.ToString() ?? string.Empty;
                        person.organisation.address2 = OrganisationAddress2?.Value.ToString() ?? string.Empty;
                        person.organisation.town = OrganisationTown?.Value.ToString() ?? string.Empty;
                        person.organisation.county = OrganisationCounty?.Value.ToString() ?? string.Empty;
                        person.organisation.postcode = OrganisationPostcode?.Value.ToString() ?? string.Empty;
                    }

                    return Ok(person);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = ex.Message; //"Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }
    }
}
