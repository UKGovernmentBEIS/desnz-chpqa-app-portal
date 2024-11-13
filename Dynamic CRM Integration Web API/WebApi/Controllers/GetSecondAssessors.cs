using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]

    public class GetSecondAssessors : ControllerBase
    {
        private readonly ILogger<GetSecondAssessors> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetSecondAssessors(ILogger<GetSecondAssessors> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Retrieves a list of Second Technical Assessors.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of Second Technical Assessors</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpGet("GetSecondAssessors")]
        [ProducesResponseType(typeof(List<Person>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [SwaggerOperation(Summary = "Get all Second Technical Assessors", Description = "Get all Second Technical Assessors")]
        public async Task<IActionResult> GetSecAssessors([Required]Guid idSubmission)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    //
                   // if (!await AuthorizationService.ValidateTAssessorRole(User, serviceClient)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //

                    List<Person> entities = new List<Person>();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "contact", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("contactid","firstname", "lastname", "emailaddress1", "desnz_usertype", "desnz_consultant", "jobtitle","address1_telephone1", "address1_telephone2"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_usertype", ConditionOperator.Equal,  (int)Person.UserType.TechnicalAssessor2),
                                new ConditionExpression("statecode", ConditionOperator.Equal, 0 )
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

                    Person myEntity = null;
                    
                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {

                        AliasedValue OrganisationId = (AliasedValue)entity["Organisation.accountid"];
                        AliasedValue OrganisationName = (AliasedValue)entity["Organisation.name"];
                    
                        myEntity = new Person();

                        myEntity.id = entity.GetAttributeValue<Guid>("contactid");
                        myEntity.firstName = entity.GetAttributeValue<string>("firstname");
                        myEntity.lastName = entity.GetAttributeValue<string>("lastname");
                        myEntity.email = entity.GetAttributeValue<string>("emailaddress1");
                        if (entity.Attributes.ContainsKey("desnz_usertype") && entity["desnz_usertype"] is OptionSetValue optionSetValue)
                        {
                            myEntity.userType = optionSetValue.Value;
                        }                      
                        myEntity.jobTitle = entity.GetAttributeValue<string>("jobtitle");
                        myEntity.consultant = entity.GetAttributeValue<bool>("desnz_consultant");
                      
                        myEntity.telephone1 = entity.GetAttributeValue<string>("address1_telephone1");
                        myEntity.telephone2 = entity.GetAttributeValue<string>("address1_telephone2");
                        myEntity.organisation = new Organisation();
                        myEntity.organisation.id = OrganisationId == null ? Guid.Empty : (Guid)OrganisationId.Value;
                        myEntity.organisation.name = OrganisationName?.Value.ToString() ?? string.Empty;
                      
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
