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
    [Route("api")]
    [ApiController]
    public class GetSiteLocationByAddress : ControllerBase
    {
        private readonly ILogger<GetSiteLocationByAddress> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetSiteLocationByAddress(ILogger<GetSiteLocationByAddress> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// Get Site Location by Address.
        /// </summary>
        ///
        /// <remarks>
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the Location found along with the Contact</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplySchemeLocationDetails), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetSiteLocationByAddress")]
        [SwaggerOperation(Summary = "Get the Location found along with the Contact", Description = "Retrieves a the Location found along with the Contact.")]
        public async Task<ActionResult<ReplySchemeLocationDetails>> GetLocationByAddress([FromQuery] RequestGetSiteLocationByAddress data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplySchemeLocationDetails locationToReturn = new ReplySchemeLocationDetails();

                    QueryExpression locationsQuery = new QueryExpression
                    {
                        EntityName = "desnz_schemelocationdetails",
                        ColumnSet = new ColumnSet("desnz_schemelocationdetailsid", "desnz_name", "desnz_address1", "desnz_address2", "desnz_town", "desnz_county", "desnz_postcode", "desnz_instructions", "desnz_areyouthesitecontactperson", "desnz_sitelocationcontact"),
                        Criteria = new FilterExpression()
                    };

                    // Always add conditions for town and postcode
                    locationsQuery.Criteria.AddCondition(new ConditionExpression("desnz_town", ConditionOperator.Equal, data.town));
                    locationsQuery.Criteria.AddCondition(new ConditionExpression("desnz_postcode", ConditionOperator.Equal, data.postcode));

                    // Conditionally add the county condition if data.county is not null
                    if (data.county != null)
                    {
                        locationsQuery.Criteria.AddCondition(new ConditionExpression("desnz_county", ConditionOperator.Equal, data.county));
                    }

                    // Add the LinkEntity for the related contact
                    locationsQuery.LinkEntities.Add(new LinkEntity
                    {
                        JoinOperator = JoinOperator.LeftOuter,
                        LinkFromEntityName = "desnz_schemelocationdetails",
                        LinkFromAttributeName = "desnz_sitelocationcontact",
                        LinkToEntityName = "desnz_sitelocationcontact",
                        LinkToAttributeName = "desnz_sitelocationcontactid",
                        Columns = new ColumnSet("desnz_sitelocationcontactid", "desnz_name", "desnz_lastname", "desnz_email", "desnz_jobtitle", "desnz_telephone1", "desnz_telephone2"),
                        EntityAlias = "SiteContact"
                    });
                    locationsQuery.AddOrder("createdon", OrderType.Descending);

                    EntityCollection locations = serviceClient.RetrieveMultiple(locationsQuery);

                    if (locations.Entities.Count > 0)
                    {
                        foreach (var location in locations.Entities)
                        {
                            if (location == null) continue;
                            bool hasAddress1 = location.Attributes.ContainsKey("desnz_address1");
                            bool hasAddress2 = location.Attributes.ContainsKey("desnz_address2");
                            bool hasContactPerson = location.Attributes.ContainsKey("desnz_sitelocationcontact");
                            bool hasInstructions = location.Attributes.ContainsKey("desnz_instructions");

                            bool theSameLocation = false;

                            // check if the given address is in the DB
                            if (hasAddress1 && data.address1 == location["desnz_address1"].ToString() &&
                                (data.address2 == null || (hasAddress2 && data.address2 == location["desnz_address2"].ToString())))
                            {
                                theSameLocation = true;
                            }
                            else if (hasAddress1 && data.address2 == location["desnz_address1"].ToString() &&
                                (hasAddress2 && data.address1 == location["desnz_address2"].ToString()))
                            {
                                theSameLocation = true;
                            }

                            // if we have the same address return it
                            if (theSameLocation)
                            {

                                //Found same location
                                locationToReturn.id = location.GetAttributeValue<Guid>("desnz_schemelocationdetailsid");
                                locationToReturn.name = location.GetAttributeValue<string>("desnz_name");
                                locationToReturn.address1 = location.GetAttributeValue<string>("desnz_address1").ToString();
                                if (hasAddress2)
                                {
                                    locationToReturn.address2 = location.GetAttributeValue<string>("desnz_address2").ToString();
                                }
                                locationToReturn.postcode = location.GetAttributeValue<string>("desnz_postcode").ToString();
                                locationToReturn.town = location.GetAttributeValue<string>("desnz_town").ToString();
                                locationToReturn.county = location.GetAttributeValue<string>("desnz_county").ToString();
                                if (hasInstructions)
                                {
                                    locationToReturn.instructions = location.GetAttributeValue<string>("desnz_instructions").ToString();
                                }
                                locationToReturn.areYouTheSiteContactPerson = location.GetAttributeValue<bool>("desnz_areyouthesitecontactperson");
                                if (hasContactPerson)
                                {
                                    locationToReturn.contactPerson = new ReplySiteLocationContact();
                                    if (location.Contains("SiteContact.desnz_sitelocationcontactid"))
                                    {
                                        locationToReturn.contactPerson.id = (Guid)((AliasedValue)location["SiteContact.desnz_sitelocationcontactid"]).Value;
                                    }
                                    if (location.Contains("SiteContact.desnz_name"))
                                    {
                                        locationToReturn.contactPerson.firstName = ((AliasedValue)location["SiteContact.desnz_name"]).Value.ToString();
                                    }
                                    if (location.Contains("SiteContact.desnz_lastname"))
                                    {
                                        locationToReturn.contactPerson.lastName = ((AliasedValue)location["SiteContact.desnz_lastname"]).Value.ToString();
                                    }
                                    if (location.Contains("SiteContact.desnz_email"))
                                    {
                                        locationToReturn.contactPerson.email = ((AliasedValue)location["SiteContact.desnz_email"]).Value.ToString();
                                    }
                                    if (location.Contains("SiteContact.desnz_jobtitle"))
                                    {
                                        locationToReturn.contactPerson.jobTitle = ((AliasedValue)location["SiteContact.desnz_jobtitle"]).Value.ToString();
                                    }
                                    if (location.Contains("SiteContact.desnz_telephone1"))
                                    {
                                        locationToReturn.contactPerson.telephone1 = ((AliasedValue)location["SiteContact.desnz_telephone1"]).Value.ToString();
                                    }
                                    if (location.Contains("SiteContact.desnz_telephone2"))
                                    {
                                        locationToReturn.contactPerson.telephone2 = ((AliasedValue)location["SiteContact.desnz_telephone2"]).Value.ToString();
                                    }
                                }
                                break;
                            }
                        }
                    }
                    else
                    {
                        ReplyMessage reply = new ReplyMessage();
                        reply.message = "NotFound";
                        return StatusCode(StatusCodes.Status404NotFound, reply);
                    }

                    if (locationToReturn.address1 == null)
                    {
                        ReplyMessage reply = new ReplyMessage();
                        reply.message = "NotFound";
                        return StatusCode(StatusCodes.Status404NotFound, reply);
                    }
                    else return Ok(locationToReturn);
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


        public class RequestGetSiteLocationByAddress
        {
  
            [Required]
            public string? address1 { get; set; }               // desnz_address1        
            public string? address2 { get; set; }               // desnz_address2
            [Required]
            public string? postcode { get; set; }               // desnz_postcode
            [Required]
            public string? town { get; set; }                   // desnz_town
            public string? county { get; set; }                 // desnz_county
          
        }
    }
}
