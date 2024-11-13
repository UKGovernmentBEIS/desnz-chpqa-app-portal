using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;
using static WebApi.Model.Submission;

namespace WebApi.Controllers
{
    [Route("api/assessors")]
    [ApiController]
    public class GetSchemesforΤAssessor : ControllerBase
    {

        private readonly ILogger<GetSchemesforΤAssessor> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetSchemesforΤAssessor(ILogger<GetSchemesforΤAssessor> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Retrieves a list of all Schemes with the given Rp UserId.
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns a list of Schemes with the given Rp UserId</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(List<ReplySchemeForAssessor>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetSchemesforTAssessor")]
        [SwaggerOperation(Summary = "Get all Schemes for Technical Assessor", Description = "Retrieves a list of all Schemes for a Technical Assessor's")]
        public async Task<ActionResult<Scheme>> GetSchemesforAssessor()
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    List<ReplySchemeForAssessor> entitiesSchemes = new List<ReplySchemeForAssessor>();

                    // List of account IDs you want to filter by
                    int[] statuses = new int[]
                    {
                        (int)SubmissionStatus.NotStarted,
                        (int)SubmissionStatus.InProgress
                    };

                    QueryExpression querySchemes = new QueryExpression
                    {
                        EntityName = "desnz_scheme", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_name", "desnz_reference", "desnz_status", "desnz_latestsubmissionstatus", "createdon", "desnz_siccode", "desnz_ecosector", "desnz_ecosubsector"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_latestsubmissionstatus", ConditionOperator.NotIn, statuses),
                                new ConditionExpression("desnz_latestsubmissionstatus", ConditionOperator.NotNull)

                            }
                        },
                        Orders =
                        {
                            new OrderExpression("createdon", OrderType.Descending) // Order by createdon in descending order
                        },
                        LinkEntities =
                        {
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.Inner, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entityc
                            LinkFromAttributeName = "desnz_schemelocationdetails", // Parent entity attribute
                            LinkToEntityName = "desnz_schemelocationdetails", // Related entity
                            LinkToAttributeName = "desnz_schemelocationdetailsid", // Related entity attribute
                            Columns =  new ColumnSet("desnz_schemelocationdetailsid","desnz_name", "desnz_address1", "desnz_address2", "desnz_town", "desnz_county", "desnz_postcode","desnz_instructions","desnz_areyouthesitecontactperson" ),
                            EntityAlias = "Site", // Alias for the related entity
                      
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.Inner, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_company", // Parent entity attribute
                            LinkToEntityName = "account", // Related entity
                            LinkToAttributeName = "accountid", // Related entity attribute
                            Columns =  new ColumnSet("accountid", "name", "desnz_registrationnumber"),
                            EntityAlias = "Organisation", // Alias for the related entity
                      
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.Inner, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_responsibleperson", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid", "firstname", "lastname", "emailaddress1"),
                            EntityAlias = "ResponsiblePerson", // Alias for the related entity
                            
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
                            Columns =  new ColumnSet("contactid", "firstname", "lastname", "emailaddress1"),
                            EntityAlias = "DelegateRP",
                        } ,
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_assessor", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid", "firstname", "lastname", "emailaddress1"),
                            EntityAlias = "TAssessor",
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_secondassessor", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid", "firstname", "lastname", "emailaddress1"),
                            EntityAlias = "SecondTAssessor",
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_siccode", // Parent entity attribute
                            LinkToEntityName = "desnz_siccode", // Related entity
                            LinkToAttributeName = "desnz_siccodeid", // Related entity attribute
                            Columns =  new ColumnSet("desnz_siccodeid", "desnz_name", "desnz_description"),
                            EntityAlias = "SicCode",
                        }
                    }
                };


                    querySchemes.PageInfo = new PagingInfo();
                    querySchemes.PageInfo.Count = 5000 ;
                    querySchemes.PageInfo.PageNumber = 1;
                    querySchemes.PageInfo.ReturnTotalRecordCount = true;

                    // Execute the QueryExpression to retrieve multiple records
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(querySchemes);



                    ReplySchemeForAssessor myEntity = null;

                    // Map query results to custom class
                    foreach (Entity entity in results.Entities)
                    {
                        //Organisation
                        AliasedValue OrganisationId = null;
                        if (entity.Attributes.ContainsKey("Organisation.accountid"))
                        {
                            OrganisationId = (AliasedValue)entity["Organisation.accountid"];
                        }
                        AliasedValue? OrganisationName = null;
                        if (entity.Attributes.ContainsKey("Organisation.name"))
                        {
                            OrganisationName = (AliasedValue)entity["Organisation.name"];
                        }
                        AliasedValue? OrganisationRegNum = null;
                        if (entity.Attributes.ContainsKey("Organisation.desnz_registrationnumber"))
                        {
                            OrganisationRegNum = (AliasedValue)entity["Organisation.desnz_registrationnumber"];
                        }

                        //Responsible Person
                        AliasedValue ResponsiblePersonId = null;
                        if (entity.Attributes.ContainsKey("ResponsiblePerson.contactid"))
                        {
                            ResponsiblePersonId = (AliasedValue)entity["ResponsiblePerson.contactid"];
                        }
                        AliasedValue ResponsiblePersonEmail = null;
                        if (entity.Attributes.ContainsKey("ResponsiblePerson.emailaddress1"))
                        {
                            ResponsiblePersonEmail = (AliasedValue)entity["ResponsiblePerson.emailaddress1"];
                        }
                        AliasedValue ResponsiblePersonFirstname = null;
                        if (entity.Attributes.ContainsKey("ResponsiblePerson.firstname"))
                        {
                            ResponsiblePersonFirstname = (AliasedValue)entity["ResponsiblePerson.firstname"];
                        }
                        AliasedValue ResponsiblePersonLastname = null;
                        if (entity.Attributes.ContainsKey("ResponsiblePerson.lastname"))
                        {
                            ResponsiblePersonLastname = (AliasedValue)entity["ResponsiblePerson.lastname"];
                        }

                        //Technical Assessor 1
                        AliasedValue TAssessorId = null;
                        if (entity.Attributes.ContainsKey("TAssessor.contactid"))
                        {
                            TAssessorId = (AliasedValue)entity["TAssessor.contactid"];
                        }
                        AliasedValue TAssessorEmail = null;
                        if (entity.Attributes.ContainsKey("TAssessor.emailaddress1"))
                        {
                            TAssessorEmail = (AliasedValue)entity["TAssessor.emailaddress1"];
                        }
                        AliasedValue TAssessorFirstname = null;
                        if (entity.Attributes.ContainsKey("TAssessor.firstname"))
                        {
                            TAssessorFirstname = (AliasedValue)entity["TAssessor.firstname"];
                        }
                        AliasedValue TAssessorLastame = null;
                        if (entity.Attributes.ContainsKey("TAssessor.lastname"))
                        {
                            TAssessorLastame = (AliasedValue)entity["TAssessor.lastname"];
                        }

                        //Technical Assessor 2
                        AliasedValue SecondTAssessorId = null;
                        if (entity.Attributes.ContainsKey("SecondTAssessor.contactid"))
                        {
                            SecondTAssessorId = (AliasedValue)entity["SecondTAssessor.contactid"];
                        }
                        AliasedValue SecondTAssessorEmail = null;
                        if (entity.Attributes.ContainsKey("SecondTAssessor.emailaddress1"))
                        {
                            SecondTAssessorEmail = (AliasedValue)entity["SecondTAssessor.emailaddress1"];
                        }
                        AliasedValue SecondTAssessorFirstname = null;
                        if (entity.Attributes.ContainsKey("SecondTAssessor.firstname"))
                        {
                            SecondTAssessorFirstname = (AliasedValue)entity["SecondTAssessor.firstname"];
                        }
                        AliasedValue SecondTAssessorLastame = null;
                        if (entity.Attributes.ContainsKey("SecondTAssessor.lastname"))
                        {
                            SecondTAssessorLastame = (AliasedValue)entity["SecondTAssessor.lastname"];
                        }

                        //SicCode
                        AliasedValue SicCodeId = null;
                        if (entity.Attributes.ContainsKey("SicCode.desnz_siccodeid"))
                        {
                            SicCodeId = (AliasedValue)entity["SicCode.desnz_siccodeid"];
                        }

                        AliasedValue SicCodeName = null;
                        if (entity.Attributes.ContainsKey("SicCode.desnz_name"))
                        {
                            SicCodeName = (AliasedValue)entity["SicCode.desnz_name"];
                        }

                        AliasedValue SicCodeDescription = null;
                        if (entity.Attributes.ContainsKey("SicCode.desnz_description"))
                        {
                            SicCodeDescription = (AliasedValue)entity["SicCode.desnz_description"];
                        }

                        //Site location
                        AliasedValue SiteId = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_schemelocationdetailsid"))
                        {
                            SiteId = (AliasedValue)entity["Site.desnz_schemelocationdetailsid"];
                        }
                        AliasedValue SiteName = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_name"))
                        {
                            SiteName = (AliasedValue)entity["Site.desnz_name"];
                        }

                        AliasedValue SiteAddress1 = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_address1"))
                        {
                            SiteAddress1 = (AliasedValue)entity["Site.desnz_address1"];
                        }

                        AliasedValue SiteAddress2 = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_address2"))
                        {
                            SiteAddress2 = (AliasedValue)entity["Site.desnz_address2"];
                        }

                        AliasedValue SitePostcode = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_postcode"))
                        {
                            SitePostcode = (AliasedValue)entity["Site.desnz_postcode"];
                        }
                        AliasedValue SiteTown = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_town"))
                        {
                            SiteTown = (AliasedValue)entity["Site.desnz_town"];
                        }
                        AliasedValue? SiteCounty = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_county"))
                        {
                            SiteCounty = (AliasedValue)entity["Site.desnz_county"];
                        }

                        AliasedValue? SiteAreYouTheSiteContactPerson = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_areyouthesitecontactperson"))
                        {
                            SiteAreYouTheSiteContactPerson = (AliasedValue)entity["Site.desnz_areyouthesitecontactperson"];
                        }

                        AliasedValue SiteInstructions = null;
                        if (entity.Attributes.ContainsKey("Site.desnz_instructions"))
                        {
                            SiteInstructions = (AliasedValue)entity["Site.desnz_instructions"];
                        }

                        //Scheme
                        myEntity = new ReplySchemeForAssessor();

                        myEntity.id = entity.GetAttributeValue<Guid>("desnz_schemeid");
                        myEntity.name = entity.GetAttributeValue<string>("desnz_name");
                        myEntity.reference = entity.GetAttributeValue<string>("desnz_reference");
                        myEntity.createdon = entity.GetAttributeValue<DateTime>("createdon");

                        if (entity.Attributes.ContainsKey("desnz_status") && entity["desnz_status"] is OptionSetValue optionSetValueStatus)
                        {
                            myEntity.status = optionSetValueStatus.Value;
                            myEntity.statusText = entity.FormattedValues.ContainsKey("desnz_status") ? entity.FormattedValues["desnz_status"] : string.Empty;
                        }
                        if (entity.Attributes.ContainsKey("desnz_latestsubmissionstatus") && entity["desnz_latestsubmissionstatus"] is OptionSetValue optionSetValueLatestSubmissionStatus)
                        {
                            myEntity.latestSubmissionStatus = optionSetValueLatestSubmissionStatus.Value;
                        }

                        // Get economic sector
                        if (entity.Attributes.ContainsKey("desnz_ecosector") && entity["desnz_ecosector"] != null)
                        {
                            EntityReference econSectorEntityRef = entity["desnz_ecosector"] as EntityReference;

                            Guid? econSectorId = econSectorEntityRef == null ? null : econSectorEntityRef.Id;
                            string econSectorName = econSectorEntityRef?.Name ?? string.Empty;

                            myEntity.econSector = new RequestEconomicSector();
                            myEntity.econSector.id = econSectorId;
                            myEntity.econSector.name = econSectorName;
                        }

                        // Get economic sub sector 
                        if (entity.Attributes.ContainsKey("desnz_ecosubsector") && entity["desnz_ecosubsector"] != null)
                        {
                            EntityReference econSubSectorEntityRef = entity["desnz_ecosubsector"] as EntityReference;

                            Guid? econSubSectorId = econSubSectorEntityRef == null ? null : econSubSectorEntityRef.Id;
                            string econSubSectorName = econSubSectorEntityRef?.Name ?? string.Empty;

                            myEntity.econSubSector = new RequestEconomicSubSector();
                            myEntity.econSubSector.id = econSubSectorId;
                            myEntity.econSubSector.name = econSubSectorName;
                        }

                        // sicCode
                        myEntity.sicCode = new SicCode();
                        myEntity.sicCode.id = SicCodeId == null ? null : (Guid)SicCodeId.Value;
                        myEntity.sicCode.name = SicCodeName?.Value.ToString() ?? string.Empty;
                        myEntity.sicCode.description = SicCodeDescription?.Value.ToString() ?? string.Empty;

                        // Organisation
                        myEntity.company = new Organisation();
                        myEntity.company.id = OrganisationId == null ? null : (Guid)OrganisationId.Value;
                        myEntity.company.name = OrganisationName?.Value.ToString() ?? string.Empty;
                        myEntity.company.registrationNumber = OrganisationRegNum?.Value.ToString() ?? string.Empty;

                        //Responsible Person
                        myEntity.responsiblePerson = new Person();
                        myEntity.responsiblePerson.id = ResponsiblePersonId == null ? null : (Guid)ResponsiblePersonId.Value;
                        myEntity.responsiblePerson.email = ResponsiblePersonEmail?.Value.ToString() ?? string.Empty;
                        myEntity.responsiblePerson.firstName = ResponsiblePersonFirstname?.Value.ToString() ?? string.Empty;
                        myEntity.responsiblePerson.lastName = ResponsiblePersonLastname?.Value.ToString() ?? string.Empty;

                        //Technical Assessor
                        myEntity.assessor = new Person();
                        myEntity.assessor.id = TAssessorId == null ? null : (Guid)TAssessorId.Value;
                        myEntity.assessor.email = TAssessorEmail?.Value.ToString() ?? string.Empty;
                        myEntity.assessor.firstName = TAssessorFirstname?.Value.ToString() ?? string.Empty;
                        myEntity.assessor.lastName = TAssessorLastame?.Value.ToString() ?? string.Empty;

                        //Second Technical Assessor
                        myEntity.secondAssessor = new Person();
                        myEntity.secondAssessor.id = SecondTAssessorId == null ? null : (Guid)SecondTAssessorId.Value;
                        myEntity.secondAssessor.email = SecondTAssessorEmail?.Value.ToString() ?? string.Empty;
                        myEntity.secondAssessor.firstName = SecondTAssessorFirstname?.Value.ToString() ?? string.Empty;
                        myEntity.secondAssessor.lastName = SecondTAssessorLastame?.Value.ToString() ?? string.Empty;

                        //Site location
                        myEntity.site = new ReplySchemeLocationDetails();
                        myEntity.site.id = SiteId == null ? null : (Guid)SiteId.Value;
                        myEntity.site.name = SiteName?.Value.ToString() ?? string.Empty;
                        myEntity.site.address1 = SiteAddress1?.Value.ToString() ?? string.Empty;
                        myEntity.site.address2 = SiteAddress2?.Value.ToString() ?? string.Empty;
                        myEntity.site.town = SiteTown?.Value.ToString() ?? string.Empty;
                        myEntity.site.county = SiteCounty?.Value.ToString() ?? string.Empty;
                        myEntity.site.postcode = SitePostcode?.Value.ToString() ?? string.Empty;
                        myEntity.site.instructions = SiteInstructions?.Value.ToString() ?? string.Empty;
                        myEntity.site.areYouTheSiteContactPerson = SiteAreYouTheSiteContactPerson == null ? null : (bool)SiteAreYouTheSiteContactPerson.Value;

                        entitiesSchemes.Add(myEntity);
                    }

                    return Ok(entitiesSchemes);
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


