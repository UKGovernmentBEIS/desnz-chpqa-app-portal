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
    public class GetSchemeById : ControllerBase
    {

        private readonly ILogger<GetSchemeById> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetSchemeById(ILogger<GetSchemeById> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Retrieves a Scheme with the given Scheme Id.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a Scheme with the given Id of a Scheme</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplyScheme), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetSchemeById")]
        [SwaggerOperation(Summary = "Get Scheme by Id", Description = "Retrieves a Scheme with the given Id.")]
        public async Task<ActionResult> SchemeById(Guid Id)
        {
            try
            {
                ReplyScheme SchemeEntity = new ReplyScheme();

                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_scheme", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_name", "desnz_reference", "desnz_status", "desnz_latestsubmissionstatus", "createdon", "desnz_siccode", "desnz_ecosector", "desnz_ecosubsector"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                                {
                                    new ConditionExpression("desnz_schemeid", ConditionOperator.Equal, Id)
                                }
                        },
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_schemelocationdetails", // Parent entity attribute
                                LinkToEntityName = "desnz_schemelocationdetails", // Related entity
                                LinkToAttributeName = "desnz_schemelocationdetailsid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_schemelocationdetailsid","desnz_name", "desnz_address1", "desnz_address2", "desnz_town", "desnz_county", "desnz_postcode","desnz_instructions","desnz_areyouthesitecontactperson" ),
                                EntityAlias = "Site", // Alias for the related entity
                                LinkEntities =
                                {
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_schemelocationdetails", // Parent entity
                                        LinkFromAttributeName = "desnz_sitelocationcontact", // Parent entity attribute
                                        LinkToEntityName = "desnz_sitelocationcontact", // Related entity
                                        LinkToAttributeName = "desnz_sitelocationcontactid", // Related entity attribute
                                        Columns =  new ColumnSet("desnz_sitelocationcontactid", "desnz_name", "desnz_lastname", "desnz_email", "desnz_jobtitle", "desnz_telephone1", "desnz_telephone2"),
                                        EntityAlias = "SiteContact", // Alias for the related entity
                      
                                    }
                                }
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_company", // Parent entity attribute
                                LinkToEntityName = "account", // Related entity
                                LinkToAttributeName = "accountid", // Related entity attribute
                                Columns =  new ColumnSet("accountid","name", "desnz_registrationnumber"),
                                EntityAlias = "Organisation", // Alias for the related entity
                      
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_responsibleperson", // Parent entity attribute
                                LinkToEntityName = "contact", // Related entity
                                LinkToAttributeName = "contactid", // Related entity attribute
                                Columns =  new ColumnSet("contactid","firstname", "lastname", "emailaddress1"),
                                EntityAlias = "ResponsiblePerson"
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_optoutrp", // Parent entity attribute
                                LinkToEntityName = "contact", // Related entity
                                LinkToAttributeName = "contactid", // Related entity attribute
                                Columns =  new ColumnSet("contactid","firstname", "lastname", "emailaddress1"),
                                EntityAlias = "OptoutRP", // Alias for the related entity                              
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_delegaterp", // Parent entity attribute
                                LinkToEntityName = "contact", // Related entity
                                LinkToAttributeName = "contactid", // Related entity attribute
                                Columns =  new ColumnSet("contactid","firstname", "lastname", "emailaddress1"),
                                EntityAlias = "DelegateRP",
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_assessor", // Parent entity attribute
                                LinkToEntityName = "contact", // Related entity
                                LinkToAttributeName = "contactid", // Related entity attribute
                                Columns =  new ColumnSet("contactid","emailaddress1"),
                                EntityAlias = "Assessor",
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_secondassessor", // Parent entity attribute
                                LinkToEntityName = "contact", // Related entity
                                LinkToAttributeName = "contactid", // Related entity attribute
                                Columns =  new ColumnSet("contactid","emailaddress1"),
                                EntityAlias = "Secondassessor",
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_siccode", // Parent entity attribute
                                LinkToEntityName = "desnz_siccode", // Related entity
                                LinkToAttributeName = "desnz_siccodeid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_siccodeid","desnz_name","desnz_description"),
                                EntityAlias = "SicCode",
                            }
                        }
                    };


                    // Execute the QueryExpression to retrieve multiple records
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);


                    
                    //
                    if (!await AuthorizationService.ValidateUserData(User, serviceClient, results)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //
                    



                    if (results.Entities.Count > 0)
                    {

                        //Organisation
                        AliasedValue OrganisationId = (AliasedValue)results.Entities[0]["Organisation.accountid"];
                        AliasedValue? OrganisationName = null;
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.name"))
                        {
                            OrganisationName = (AliasedValue)results.Entities[0]["Organisation.name"];
                        }
                        AliasedValue? OrganisationRegNum = null;
                        if (results.Entities[0].Attributes.ContainsKey("Organisation.desnz_registrationnumber"))
                        {
                            OrganisationRegNum = (AliasedValue)results.Entities[0]["Organisation.desnz_registrationnumber"];
                        }

                        //Responsible Person
                        AliasedValue ResponsiblePersonId = (AliasedValue)results.Entities[0]["ResponsiblePerson.contactid"];
                        AliasedValue ResponsiblePersonEmail = (AliasedValue)results.Entities[0]["ResponsiblePerson.emailaddress1"];
                        AliasedValue ResponsiblePersonFirstname = (AliasedValue)results.Entities[0]["ResponsiblePerson.firstname"];
                        AliasedValue ResponsiblePersonLastname = (AliasedValue)results.Entities[0]["ResponsiblePerson.lastname"];

                        //SicCode
                        AliasedValue SicCodeId = null;
                        if (results.Entities[0].Attributes.ContainsKey("SicCode.desnz_siccodeid"))
                        {
                            SicCodeId = (AliasedValue)results.Entities[0]["SicCode.desnz_siccodeid"];
                        }

                        AliasedValue SicCodeName = null;
                        if (results.Entities[0].Attributes.ContainsKey("SicCode.desnz_name"))
                        {
                            SicCodeName = (AliasedValue)results.Entities[0]["SicCode.desnz_name"];
                        }

                        AliasedValue SicCodeDescription = null;
                        if (results.Entities[0].Attributes.ContainsKey("SicCode.desnz_description"))
                        {
                            SicCodeDescription = (AliasedValue)results.Entities[0]["SicCode.desnz_description"];
                        }

                        AliasedValue SiteId = (AliasedValue)results.Entities[0]["Site.desnz_schemelocationdetailsid"];
                        AliasedValue SiteName = null;
                        if (results.Entities[0].Attributes.ContainsKey("Site.desnz_name"))
                        {
                            SiteName = (AliasedValue)results.Entities[0]["Site.desnz_name"];
                        }

                        //Site location
                        AliasedValue SiteAddress1 = null;
                        if (results.Entities[0].Attributes.ContainsKey("Site.desnz_address1"))
                        {
                            SiteAddress1 = (AliasedValue)results.Entities[0]["Site.desnz_address1"];
                        }

                        AliasedValue SiteAddress2 = null;
                        if (results.Entities[0].Attributes.ContainsKey("Site.desnz_address2"))
                        {
                            SiteAddress2 = (AliasedValue)results.Entities[0]["Site.desnz_address2"];
                        }

                        AliasedValue SitePostcode = (AliasedValue)results.Entities[0]["Site.desnz_postcode"];
                        AliasedValue SiteTown = (AliasedValue)results.Entities[0]["Site.desnz_town"];

                        AliasedValue? SiteCounty = null;
                        if (results.Entities[0].Attributes.ContainsKey("Site.desnz_county"))
                        {
                            SiteCounty = (AliasedValue)results.Entities[0]["Site.desnz_county"];
                        }

                        AliasedValue? SiteAreYouTheSiteContactPerson = null;
                        if (results.Entities[0].Attributes.ContainsKey("Site.desnz_areyouthesitecontactperson"))
                        {
                            SiteAreYouTheSiteContactPerson = (AliasedValue)results.Entities[0]["Site.desnz_areyouthesitecontactperson"];
                        }

                        AliasedValue SiteInstructions = null;
                        if (results.Entities[0].Attributes.ContainsKey("Site.desnz_instructions"))
                        {
                            SiteInstructions = (AliasedValue)results.Entities[0]["Site.desnz_instructions"];
                        }

                        //Scheme
                        SchemeEntity.id = results.Entities[0].GetAttributeValue<Guid>("desnz_schemeid");
                        SchemeEntity.name = results.Entities[0].GetAttributeValue<string>("desnz_name");
                        SchemeEntity.reference = results.Entities[0].GetAttributeValue<string>("desnz_reference");
                        SchemeEntity.createdon = results.Entities[0].GetAttributeValue<DateTime>("createdon");

                        if (results.Entities[0].Attributes.ContainsKey("desnz_status") && results.Entities[0]["desnz_status"] is OptionSetValue optionSetValue)
                        {
                            SchemeEntity.status = optionSetValue.Value;
                            SchemeEntity.statusText = results.Entities[0].FormattedValues.ContainsKey("desnz_status") ? results.Entities[0].FormattedValues["desnz_status"] : string.Empty;
                        }
                        if (results.Entities[0].Attributes.ContainsKey("desnz_latestsubmissionstatus") && results.Entities[0]["desnz_latestsubmissionstatus"] is OptionSetValue optionSetValueLatestSubmissionStatus)
                        {
                            SchemeEntity.latestSubmissionStatus = optionSetValueLatestSubmissionStatus.Value;
                        }

                        // Get economic sector
                        if (results.Entities[0].Attributes.ContainsKey("desnz_ecosector") && results.Entities[0]["desnz_ecosector"] != null)
                        {
                            EntityReference econSectorEntityRef = results.Entities[0]["desnz_ecosector"] as EntityReference;

                            Guid econSectorId = econSectorEntityRef == null ? Guid.Empty : econSectorEntityRef.Id;
                            string econSectorName = econSectorEntityRef?.Name ?? string.Empty;

                            SchemeEntity.econSector = new RequestEconomicSector();
                            SchemeEntity.econSector.id = econSectorId;
                            SchemeEntity.econSector.name = econSectorName;
                        }

                        // Get economic sub sector 
                        if (results.Entities[0].Attributes.ContainsKey("desnz_ecosubsector") && results.Entities[0]["desnz_ecosubsector"] != null)
                        {
                            EntityReference econSubSectorEntityRef = results.Entities[0]["desnz_ecosubsector"] as EntityReference;

                            Guid econSubSectorId = econSubSectorEntityRef == null ? Guid.Empty : econSubSectorEntityRef.Id;
                            string econSubSectorName = econSubSectorEntityRef?.Name ?? string.Empty;

                            SchemeEntity.econSubSector = new RequestEconomicSubSector();
                            SchemeEntity.econSubSector.id = econSubSectorId;
                            SchemeEntity.econSubSector.name = econSubSectorName;
                        }

                        // sicCode
                        SchemeEntity.sicCode = new SicCode();
                        SchemeEntity.sicCode.id = SicCodeId == null ? Guid.Empty : (Guid)SicCodeId.Value;
                        SchemeEntity.sicCode.name = SicCodeName?.Value.ToString() ?? string.Empty;
                        SchemeEntity.sicCode.description = SicCodeDescription?.Value.ToString() ?? string.Empty;

                        //Organisation
                        SchemeEntity.company = new Organisation();
                        SchemeEntity.company.id = OrganisationId == null ? Guid.Empty : (Guid)OrganisationId.Value;
                        SchemeEntity.company.name = OrganisationName?.Value.ToString() ?? string.Empty;
                        SchemeEntity.company.registrationNumber = OrganisationRegNum?.Value.ToString() ?? string.Empty;

                        //Responsible Person
                        SchemeEntity.responsiblePerson = new Person();
                        SchemeEntity.responsiblePerson.id = ResponsiblePersonId == null ? Guid.Empty : (Guid)ResponsiblePersonId.Value;
                        SchemeEntity.responsiblePerson.email = ResponsiblePersonEmail?.Value.ToString() ?? string.Empty;
                        SchemeEntity.responsiblePerson.firstName = ResponsiblePersonFirstname?.Value.ToString() ?? string.Empty;
                        SchemeEntity.responsiblePerson.lastName = ResponsiblePersonLastname?.Value.ToString() ?? string.Empty;

                        //Site location
                        SchemeEntity.site = new ReplySchemeLocationDetails();
                        SchemeEntity.site.id = SiteId == null ? Guid.Empty : (Guid)SiteId.Value;
                        SchemeEntity.site.name = SiteName?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.address1 = SiteAddress1?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.address2 = SiteAddress2?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.town = SiteTown?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.county = SiteCounty?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.postcode = SitePostcode?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.instructions = SiteInstructions?.Value.ToString() ?? string.Empty;
                        SchemeEntity.site.areYouTheSiteContactPerson = SiteAreYouTheSiteContactPerson == null ? null : (bool)SiteAreYouTheSiteContactPerson.Value;

                        SchemeEntity.site.contactPerson = new ReplySiteLocationContact();

                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_sitelocationcontactid"))
                        {
                            SchemeEntity.site.contactPerson.id = (Guid)((AliasedValue)results.Entities[0]["SiteContact.desnz_sitelocationcontactid"]).Value;
                        }
                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_name"))
                        {
                            SchemeEntity.site.contactPerson.firstName = ((AliasedValue)results.Entities[0]["SiteContact.desnz_name"]).Value.ToString();
                        }
                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_lastname"))
                        {
                            SchemeEntity.site.contactPerson.lastName = ((AliasedValue)results.Entities[0]["SiteContact.desnz_lastname"]).Value.ToString();
                        }
                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_email"))
                        {
                            SchemeEntity.site.contactPerson.email = ((AliasedValue)results.Entities[0]["SiteContact.desnz_email"]).Value.ToString();
                        }
                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_jobtitle"))
                        {
                            SchemeEntity.site.contactPerson.jobTitle = ((AliasedValue)results.Entities[0]["SiteContact.desnz_jobtitle"]).Value.ToString();
                        }
                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_telephone1"))
                        {
                            SchemeEntity.site.contactPerson.telephone1 = ((AliasedValue)results.Entities[0]["SiteContact.desnz_telephone1"]).Value.ToString();
                        }
                        if (results.Entities[0].Attributes.ContainsKey("SiteContact.desnz_telephone2"))
                        {
                            SchemeEntity.site.contactPerson.telephone2 = ((AliasedValue)results.Entities[0]["SiteContact.desnz_telephone2"]).Value.ToString();
                        }

                        
                    }
                    return Ok(SchemeEntity);
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
