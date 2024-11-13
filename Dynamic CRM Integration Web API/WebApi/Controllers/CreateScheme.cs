using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Vml.Office;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.RegularExpressions;
using WebApi.Contracts;
using WebApi.Functions;
using WebApi.Model;
using WebApi.Services;
using static WebApi.Model.Policy;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class CreateScheme : ControllerBase
    {
        private readonly ILogger<CreateScheme> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public CreateScheme(ILogger<CreateScheme> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }

        /// <summary>
        /// "Creates a Scheme with the given data.
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the Scheme id that was created.</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpPost("CreateScheme")]
        public async Task<ActionResult> PostScheme(RequestScheme data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    ReplyMessage reply = new ReplyMessage();

                    // get the policies
                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_schemepolicy",
                        ColumnSet = new ColumnSet("desnz_schemepolicyid", "desnz_id", "desnz_name", "desnz_type", "desnz_latest")
                    };
                    EntityCollection policyresults = serviceClient.RetrieveMultiple(query);

                    // new account ( organisation )
                    Entity account = new("account");
                    if (data.company?.id == null)
                    {
                        account["name"] = data.company?.name;
                        account["desnz_registrationnumber"] = data.company?.registrationNumber;
                        account["address1_name"] = data.company?.address1;
                        account["address2_name"] = data.company?.address2;
                        account["address1_city"] = data.company?.town;
                        account["address1_county"] = data.company?.county;
                        account["address1_postalcode"] = data.company?.postcode;
                        account.Id = await serviceClient.CreateAsync(account);
                    }
                    else account.Id = data.company?.id ?? Guid.Empty;



                    // site location contact
                    Entity SiteContactPerson = null;

                    // if contact id is null update based on email or make new site location Contact
                    if (data.site != null && data.site.contactPerson != null && data.site.contactPerson.id == null)
                    {
                        query = new QueryExpression
                        {
                            EntityName = "desnz_sitelocationcontact", // Specify the name of the parent entity
                            ColumnSet = new ColumnSet("desnz_sitelocationcontactid"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                {
                                    new ConditionExpression("desnz_email", ConditionOperator.Equal,  data.site?.contactPerson?.email.ToLower())
                                }
                            },
                            TopCount = 1 // Limit the result to only one record
                        };

                        EntityCollection results = serviceClient.RetrieveMultiple(query);


                        // update values based on email 
                        if (results.Entities.Count > 0)
                        {
                            SiteContactPerson = new Entity("desnz_sitelocationcontact", results.Entities[0].GetAttributeValue<Guid>("desnz_sitelocationcontactid"));

                            SiteContactPerson["desnz_name"] = data.site?.contactPerson?.firstName;
                            SiteContactPerson["desnz_lastname"] = data.site?.contactPerson?.lastName;
                            SiteContactPerson["desnz_email"] = data.site?.contactPerson?.email;
                            SiteContactPerson["desnz_jobtitle"] = data.site?.contactPerson?.jobTitle;
                            SiteContactPerson["desnz_telephone1"] = data.site?.contactPerson?.telephone1;
                            SiteContactPerson["desnz_telephone2"] = data.site?.contactPerson?.telephone2;

                            await serviceClient.UpdateAsync(SiteContactPerson);
                        }
                        else    // or create new entity
                        {
                            SiteContactPerson = new("desnz_sitelocationcontact");

                            SiteContactPerson["desnz_name"] = data.site?.contactPerson?.firstName;
                            SiteContactPerson["desnz_lastname"] = data.site?.contactPerson?.lastName;
                            SiteContactPerson["desnz_email"] = data.site?.contactPerson?.email;
                            SiteContactPerson["desnz_jobtitle"] = data.site?.contactPerson?.jobTitle;
                            SiteContactPerson["desnz_telephone1"] = data.site?.contactPerson?.telephone1;
                            SiteContactPerson["desnz_telephone2"] = data.site?.contactPerson?.telephone2;

                            SiteContactPerson.Id = await serviceClient.CreateAsync(SiteContactPerson);
                        }
                    }
                    else        // if site contact id is not null
                    {
                        SiteContactPerson = new("desnz_sitelocationcontact");

                        // if user is the site contact person
                        if (data.site?.areYouTheSiteContactPerson == true)
                        {
                            Person userPerson = await HelperFunctions.GetUserPersonInfoAsync(serviceClient, User);

                            // if cannot find user email in DB return error
                            if (userPerson.email == null)
                            {
                                _logger.LogError("User email does not exist in DB");
                                reply.message = "Internal Server Error Occurred";
                                return StatusCode(StatusCodes.Status500InternalServerError, reply);
                            }
                            else    // else find email of user in site contact to update or create copy paste data of user contact
                            {

                                query = new QueryExpression
                                {
                                    EntityName = "desnz_sitelocationcontact", // Specify the name of the parent entity
                                    ColumnSet = new ColumnSet("desnz_sitelocationcontactid", "desnz_email"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                          new ConditionExpression("desnz_email", ConditionOperator.Equal, userPerson?.email.ToLower())
                                        }
                                    },
                                    TopCount = 1 // Limit the result to only one record
                                };

                                EntityCollection results = serviceClient.RetrieveMultiple(query);

                                SiteContactPerson["desnz_name"] = userPerson?.firstName;
                                SiteContactPerson["desnz_lastname"] = userPerson?.lastName;
                                SiteContactPerson["desnz_email"] = userPerson?.email;
                                SiteContactPerson["desnz_jobtitle"] = userPerson?.jobTitle;
                                SiteContactPerson["desnz_telephone1"] = userPerson?.telephone1;
                                SiteContactPerson["desnz_telephone2"] = userPerson?.telephone2;


                                // if can not find user email in site location contact create new entity
                                if (results.Entities.Count == 0)
                                {
                                    SiteContactPerson.Id = await serviceClient.CreateAsync(SiteContactPerson);
                                }
                                else    // if can find user in site contacts just update the fields
                                {
                                    SiteContactPerson.Id = results.Entities[0].GetAttributeValue<Guid>("desnz_sitelocationcontactid");

                                    await serviceClient.UpdateAsync(SiteContactPerson);
                                }
                            }
                        }
                        else    // if user is not the site contact person (and site contact id is not null)
                        {
                           
                            query = new QueryExpression
                            {
                                EntityName = "desnz_sitelocationcontact", // Specify the name of the parent entity
                                ColumnSet = new ColumnSet("desnz_sitelocationcontactid", "desnz_email"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("desnz_sitelocationcontactid", ConditionOperator.Equal, data.site.contactPerson.id )
                                    }
                                },
                                TopCount = 1 // Limit the result to only one record
                            };

                            EntityCollection results = serviceClient.RetrieveMultiple(query);

                            SiteContactPerson["desnz_name"] = data.site.contactPerson?.firstName;
                            SiteContactPerson["desnz_lastname"] = data.site.contactPerson?.lastName;
                            SiteContactPerson["desnz_email"] = data.site.contactPerson?.email;
                            SiteContactPerson["desnz_jobtitle"] = data.site.contactPerson?.jobTitle;
                            SiteContactPerson["desnz_telephone1"] = data.site.contactPerson?.telephone1;
                            SiteContactPerson["desnz_telephone2"] = data.site.contactPerson?.telephone2;

                            // if can find the site contact by id and there is a different email then make new entry in DB
                            if (results.Entities.Count > 0 && data.site?.contactPerson?.email != results.Entities[0].GetAttributeValue<string?>("desnz_email"))
                            {
                                SiteContactPerson.Id = await serviceClient.CreateAsync(SiteContactPerson);
                            }
                            else    // else update the site contact
                            {
                                SiteContactPerson.Id = results.Entities[0].GetAttributeValue<Guid>("desnz_sitelocationcontactid");

                                await serviceClient.UpdateAsync(SiteContactPerson);

                            }

                        }
                    }
                    


                    // site location
                    Entity Schemelocationdetails = null;

                    // create new or update site loction entity
                    if (data.site == null || data.site.id == null)
                    {
                        Schemelocationdetails = new("desnz_schemelocationdetails");

                        Schemelocationdetails["desnz_name"] = data.site?.name;
                        Schemelocationdetails["desnz_address1"] = data.site?.address1;
                        Schemelocationdetails["desnz_address2"] = data.site?.address2;
                        Schemelocationdetails["desnz_town"] = data.site?.town;
                        Schemelocationdetails["desnz_county"] = data.site?.county;
                        Schemelocationdetails["desnz_postcode"] = data.site?.postcode;
                        Schemelocationdetails["desnz_instructions"] = data.site?.instructions;
                        Schemelocationdetails["desnz_areyouthesitecontactperson"] = data.site?.areYouTheSiteContactPerson;

                        Schemelocationdetails["desnz_sitelocationcontact"] = new EntityReference("desnz_sitelocationcontact", SiteContactPerson.Id);

                        Schemelocationdetails.Id = await serviceClient.CreateAsync(Schemelocationdetails);
                    }
                    else
                    {
                        Schemelocationdetails = new Entity("desnz_schemelocationdetails", data.site.id ?? Guid.Empty);

                        Schemelocationdetails["desnz_sitelocationcontact"] = new EntityReference("desnz_sitelocationcontact", SiteContactPerson.Id);

                        await serviceClient.UpdateAsync(Schemelocationdetails);
                    }



                    // -------------------------------------------------------------------------
                    // Calculate reference number: 
                    // if location already exists, it should be reference number + next-postfix
                    // else if location is new, it should be next greatest prefix number + 'AA'
                    // -------------------------------------------------------------------------

                    string currentReference = "";
                    int? lastRefNumUsed = -1;
                    bool siteIsUsedInAScheme = false;


                    EntityCollection schemeResults = null;

                    if (data.site.id != null) //If SiteId provided
                    {
                        //Fetch all schemes with same SiteId with Guid PROVIDED
                        QueryExpression schemeQuery = new QueryExpression
                        {
                            EntityName = "desnz_scheme",
                            ColumnSet = new ColumnSet("desnz_schemeid", "desnz_name", "desnz_reference", "desnz_schemelocationdetails"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                {
                                    new ConditionExpression("desnz_schemelocationdetails", ConditionOperator.Equal, data.site.id),
                                }
                            }
                        };

                        //Get last scheme with same location first
                        schemeQuery.AddOrder("createdon", OrderType.Descending);
                        schemeResults = await serviceClient.RetrieveMultipleAsync(schemeQuery);

                        if (schemeResults.Entities.Count > 0)
                        {
                            siteIsUsedInAScheme = true;
                        }
                    }

                    if (siteIsUsedInAScheme)
                    {
                        var validReference = schemeResults.Entities.Where(entity => !string.IsNullOrEmpty(entity.GetAttributeValue<string>("desnz_reference"))).Select(entity =>
                        entity.GetAttributeValue<string>("desnz_reference")).FirstOrDefault();
                        if (validReference != null)
                        { 
                            currentReference = IncrementAlphabeticPart(validReference);
                        }
                    }
                    else //If siteId NOT provided
                    {
                        //Fetch all schemes
                        QueryExpression schemeQuery = new QueryExpression
                        {
                            EntityName = "desnz_scheme",
                            ColumnSet = new ColumnSet("desnz_reference")
                        };

                        // Set up paging for the query
                        schemeQuery.PageInfo = new PagingInfo
                        {
                            PageNumber = 1, // Start with page 1
                            Count = 5000    // Max number of records per page (5000 is the max allowed)
                        };

                        EntityCollection allResults = new EntityCollection();

                        bool moreRecords = true;
                        while (moreRecords)
                        {
                            // Retrieve the results for the current page
                            schemeResults = serviceClient.RetrieveMultiple(schemeQuery);

                            // Add the current page of results to the overall collection
                            allResults.Entities.AddRange(schemeResults.Entities);

                            // Check if there are more records to fetch
                            if (schemeResults.MoreRecords)
                            {
                                // Set the paging cookie and move to the next page
                                schemeQuery.PageInfo.PageNumber++;
                                schemeQuery.PageInfo.PagingCookie = schemeResults.PagingCookie;
                            }
                            else
                            {
                                moreRecords = false; // No more records to fetch
                            }
                        }

                        // Now process all fetched results
                        string? referenceToBeInserted;
                        string? numericPart;
                        char? alphabeticPart;
                        bool found = false;

                        if (allResults.Entities.Count > 0)
                        {
                            lastRefNumUsed = allResults.Entities.Select(e => e.GetAttributeValue<string>("desnz_reference")).Where(reference => reference != null &&
                            Regex.IsMatch(reference, @"^\d+")).Select(reference => GetIntToken(reference)).DefaultIfEmpty(0).Max(); // In case there are no valid references, default to 0
                        }

                        // Generate new reference based on the last used reference
                        currentReference = (lastRefNumUsed + 1).ToString().PadLeft(6, '0') + "AA";
                    }
                    // -------------------------------------------------------------------------
                    // END STEP 2
                    // -------------------------------------------------------------------------

                    Entity scheme = new("desnz_scheme");

                    if(currentReference == "")
                    {
                        Exception ex = null;
                        throw new Exception(@"desnz_reference is null", ex);
                    }

                    scheme["desnz_reference"] = currentReference;

                    scheme["desnz_name"] = data.name;

                    scheme["desnz_responsibleperson"] = new EntityReference("contact", data.responsiblePerson?.id ?? Guid.Empty);

                    scheme["desnz_status"] = new OptionSetValue(data.status ?? 0);

                    if (data.econSector != null)
                    {
                        scheme["desnz_ecosector"] = new EntityReference("desnz_sector", data.econSector?.id ?? Guid.Empty);
                    }
                    if (data.econSubSector != null)
                    {
                        scheme["desnz_ecosubsector"] = new EntityReference("desnz_subsector", data.econSubSector?.id ?? Guid.Empty);
                    }

                    if (data.sicCodeId != null)
                    {
                        scheme["desnz_siccode"] = new EntityReference("desnz_siccode", data.sicCodeId ?? Guid.Empty);
                    }

                    scheme["desnz_company"] = new EntityReference("account", account.Id);

                    scheme["desnz_schemelocationdetails"] = new EntityReference("desnz_schemelocationdetails", Schemelocationdetails.Id);


                    // HAVE TO GET THE POLICIES AND SET THE LATEST chpqa and rocs/cfd
                    // Filter and set the latest ROCs/CFD policy
                    var latestRocsOrCfdPolicyId = policyresults.Entities.Where(policy => (policy.GetAttributeValue<bool?>("desnz_latest") == true) &&
                    (policy.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)PolicyTypes.ROCs ||
                    policy.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)PolicyTypes.CFD)).FirstOrDefault().GetAttributeValue<Guid>("desnz_schemepolicyid");

                    if (latestRocsOrCfdPolicyId != null)
                    {
                        scheme["desnz_policyrocs"] = new EntityReference("desnz_schemepolicy", latestRocsOrCfdPolicyId);
                    }

                    // Filter and set the latest CHPQA policy
                    var latestChpqaPolicyId = policyresults.Entities.Where(policy => (policy.GetAttributeValue<bool?>("desnz_latest") == true) &&
                    (policy.GetAttributeValue<OptionSetValue>("desnz_type").Value == (int)PolicyTypes.CHPQA)).FirstOrDefault().GetAttributeValue<Guid>("desnz_schemepolicyid");

                    if (latestChpqaPolicyId != null)
                    {
                        scheme["desnz_policychpqa"] = new EntityReference("desnz_schemepolicy", latestChpqaPolicyId);
                    }

                    scheme.Id = await serviceClient.CreateAsync(scheme);


                    _logger.LogInformation("New Scheme created at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), scheme.Id.ToString());

                    return Ok(scheme.Id);

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

        public static int GetIntToken(string input)
        {
            // Regular expression to extract leading numeric part
            Match match = Regex.Match(input, @"^\d+");

            if (match.Success)
            {
                // Convert the numeric part to an integer
                int number = int.Parse(match.Value);
                // Return the next number
                return number;
            }
            else
            {
                return 0;
            }
        }

        private static string IncrementAlphabeticPart(string letters)
        {
            StringBuilder sb = new StringBuilder(letters);
            int length = sb.Length;

            for (int i = length - 1; i >= 0; i--)
            {
                if (sb[i] == 'Z')
                {
                    sb[i] = 'A'; // Wrap around to 'A'
                    if (i == 0)
                    {
                        // Prepend 'A' if we reached the beginning and need to add another letter
                        sb.Insert(0, 'A');
                    }
                }
                else if (sb[i] == 'z')
                {
                    sb[i] = 'a'; // Wrap around to 'a'
                    if (i == 0)
                    {
                        // Prepend 'a' if we reached the beginning and need to add another letter
                        sb.Insert(0, 'a');
                    }
                }
                else
                {
                    sb[i]++; // Increment the current character
                    break;
                }
            }

            return sb.ToString();
        }
    }

    public class RequestScheme                             // desnz_scheme
    {

        [Required]
        public string? name { get; set; }                               // desnz_name
        public string? reference { get; set; }                          // desnz_reference
        public DateTime? createdon { get; set; }                        // createdon
        [Required]
        public int? status { get; set; }                                // desnz_schemestatus
        public string? statusText { get; set; }                         // 
        [Required]
        public Organisation? company { get; set; }                      // desnz_company
        [Required]
        public Person? responsiblePerson { get; set; }                  // desnz_responsibleperson
        [Required]
        public RequestSchemeLocationDetails? site { get; set; }                // desnz_schemelocationdetails
        public RequestEconomicSector? econSector { set; get; }                 // desnz_ecosector
        public RequestEconomicSubSector? econSubSector { set; get; }           // desnz_ecosubsector
        public Guid? sicCodeId { get; set; }                            // desnz_siccode

    }

    public class RequestSchemeLocationDetails
    {

        public Guid? id { get; set; }                       // desnz_schemelocationdetailsid
        public string? name { get; set; }                   // desnz_name
        [Required]
        public string? address1 { get; set; }               // desnz_address1
        public string? address2 { get; set; }               // desnz_address2
        [Required]
        public string? postcode { get; set; }               // desnz_postcode
        [Required]
        public string? town { get; set; }                   // desnz_town
        public string? county { get; set; }                 // desnz_county
        public string? instructions { get; set; }           // desnz_instructions
        public bool? areYouTheSiteContactPerson { get; set; }           // desnz_areyouthesitecontactperson
        public RequestSiteContact? contactPerson { get; set; }          // desnz_sitecontact

    }

    public class RequestSiteContact
    {
        public Guid? id { set; get; }                   // contactid
        [Required]
        public string? firstName { get; set; }          // firstname
        [Required]
        public string? lastName { get; set; }           // lastname
        [Required]
        public string? email { get; set; }              // emailaddress1
        [Required]
        public string? jobTitle { get; set; }           // jobtitle
        [Required]
        public string? telephone1 { get; set; }         // address1_telephone1
        public string? telephone2 { get; set; }         // address1_telephone2

    }

}
