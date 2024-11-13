using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Text.Json;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class GetAddressInformation : ControllerBase
    {
        private readonly ILogger<GetAddressInformation> _logger;

        private readonly string _addressInfoApiKey;
        private readonly string _addressInfoBaseUrl;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetAddressInformation(IConfiguration configuration, ILogger<GetAddressInformation> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _addressInfoApiKey = Environment.GetEnvironmentVariable("AddressInfoApiKey");
            _addressInfoBaseUrl = configuration["AddressInfoBaseUrl"];
            _serviceClientFactory = serviceClientFactory;
        }
        [HttpGet("GetAddressInformation")]
        [SwaggerOperation(Summary = "Get Address Information", Description = "Get Address Information")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(List<ReplyAddressInfo>), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        public async Task<ActionResult> GetAddressInfo(string? postcode, string? buildingNameOrNumber)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    // Set the base address
                    client.BaseAddress = new Uri(_addressInfoBaseUrl);

                    // Set the Key header
                    client.DefaultRequestHeaders.Add("key", _addressInfoApiKey);
                    string dataset = "DPA,LPI";
                    // Make the GET request
                    HttpResponseMessage response = await client.GetAsync($"postcode?postcode={postcode}&dataset={dataset}");

                    List<ReplyAddressInfo> replyAddressInfoList = new List<ReplyAddressInfo>();
                    List<TMPAddressInfo> tmpAddressInfoList = new List<TMPAddressInfo>();

                    bool searchWithNumber = false;
                    int buildingNumber = 0;

                    if (Int32.TryParse(buildingNameOrNumber, out buildingNumber))
                    {
                        searchWithNumber = true;
                    }
                    // capitalize building Name
                    if (!searchWithNumber && buildingNameOrNumber != null)
                    {
                        buildingNameOrNumber = buildingNameOrNumber.ToUpper();
                    }

                    bool storeAddress = false;

                    if (response.IsSuccessStatusCode)
                    {
                        // Read and display the response body
                        string responseBody = await response.Content.ReadAsStringAsync();
                        AddressApiResponse addressApiBody = JsonSerializer.Deserialize<AddressApiResponse>(responseBody);

                        // if 0 results then return empty list
                        if(addressApiBody.header.totalresults == 0)
                        {
                            return Ok(replyAddressInfoList);
                        }

                        // map the DPA values
                        foreach (AddressApiResult result in addressApiBody.results)
                        {
                            if(result.DPA != null)
                            {
                                storeAddress = false;

                                // if we do not have a building number or name in request 
                                if (buildingNameOrNumber == null || buildingNameOrNumber == "")
                                {
                                    storeAddress = true;
                                }
                                else // else check the building number or name
                                {
                                    // if building number is same or else if building name is the same then store address
                                    if (searchWithNumber && result.DPA.BUILDING_NUMBER != null && result.DPA.BUILDING_NUMBER == buildingNameOrNumber)
                                    {
                                        storeAddress = true;
                                    }
                                    else if (!searchWithNumber && result.DPA.BUILDING_NAME != null && result.DPA.BUILDING_NAME == buildingNameOrNumber)
                                    {
                                        storeAddress = true;
                                    }
                                }
                                if (storeAddress)
                                {
                                    string street1 = null;

                                    street1 += result.DPA.ORGANISATION_NAME != null ? result.DPA.ORGANISATION_NAME + " " : null;
                                    street1 += result.DPA.BUILDING_NUMBER != null ? result.DPA.BUILDING_NUMBER + " " : null;
                                    street1 += result.DPA.BUILDING_NAME != null ? result.DPA.BUILDING_NAME + " " : null;
                                    street1 += result.DPA.THOROUGHFARE_NAME != null ? result.DPA.THOROUGHFARE_NAME : null;

                                    string street2 = null;

                                    street2 += result.DPA.SUB_BUILDING_NAME != null ? result.DPA.SUB_BUILDING_NAME : null;

                                    TMPAddressInfo tmpAddressInfo = new TMPAddressInfo();

                                    tmpAddressInfo.uprn = result.DPA.UPRN;
                                    tmpAddressInfo.address1 = street1;
                                    tmpAddressInfo.address2 = street2;
                                    //tmpAddressInfo.organName = result.DPA.ORGANISATION_NAME;
                                    tmpAddressInfo.town = result.DPA.POST_TOWN;
                                    tmpAddressInfo.county = result.DPA.LOCAL_CUSTODIAN_CODE_DESCRIPTION;
                                    tmpAddressInfo.postcode = result.DPA.POSTCODE;

                                    tmpAddressInfoList.Add(tmpAddressInfo);
                                }
                            }
                        }

                        // look into all LPIs answers
                        foreach (AddressApiResult result in addressApiBody.results)
                        {
                            if (result.LPI != null)
                            {
                                //for each tmp reply
                                foreach (TMPAddressInfo tmpAddressInfo in tmpAddressInfoList)
                                {
                                    // that has the same uprn
                                    if(tmpAddressInfo.uprn == result.LPI.UPRN)
                                    {
                                        //set the correct county field
                                        tmpAddressInfo.county = result.LPI.ADMINISTRATIVE_AREA != null ? result.LPI.ADMINISTRATIVE_AREA : null;
                                    }
                                }
                            }
                        }

                        // mat the tmp reply to the reply class
                        foreach (TMPAddressInfo tmpAddressInfo in tmpAddressInfoList)
                        {
                            ReplyAddressInfo replyAddressInfo = new ReplyAddressInfo();

                            replyAddressInfo.address1 = tmpAddressInfo.address1;
                            replyAddressInfo.address2 = tmpAddressInfo.address2;
                            replyAddressInfo.town = tmpAddressInfo.town;
                            replyAddressInfo.county = tmpAddressInfo.county;
                            replyAddressInfo.postcode = tmpAddressInfo.postcode;

                            replyAddressInfoList.Add(replyAddressInfo);
                        }

                        return Ok(replyAddressInfoList);
                    }
                    else
                    {
                        return StatusCode((int)response.StatusCode, response.ReasonPhrase);
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

        public class TMPAddressInfo
        {
            public string? uprn { get; set; }
            public string? address1 { get; set; }
            public string? address2 { get; set; }
            public string? town { get; set; }
            public string? county { get; set; }
            public string? postcode { get; set; }


        }

        public class AddressApiResponse
        {
            public AddressApiHeader header { get; set; }
            public AddressApiResult[] results { get; set; }
        }

        public class AddressApiHeader
        {
            public string uri { get; set; }
            public string query { get; set; }
            public int offset { get; set; }
            public int totalresults { get; set; }
            public string format { get; set; }
            public string dataset { get; set; }
            public string lr { get; set; }
            public int maxresults { get; set; }
            public string epoch { get; set; }
            public string lastupdate { get; set; }
            public string output_srs { get; set; }
        }

        public class AddressApiResult
        {
            public DPA DPA { get; set; }
            public LPI LPI { get; set; }
        }
       
        public class DPA
        {
            public string UPRN { get; set; }
            public string UDPRN { get; set; }
            public string ADDRESS { get; set; }
            public string ORGANISATION_NAME { get; set; }
            public string BUILDING_NUMBER { get; set; }
            public string SUB_BUILDING_NAME { get; set; }
            public string BUILDING_NAME { get; set; }
            public string DEPENDENT_THOROUGHFARE_NAME { get; set; }
            public string THOROUGHFARE_NAME { get; set; }
            public string DOUBLE_DEPENDENT_LOCALITY { get; set; }
            public string DEPENDENT_LOCALITY { get; set; }
            public string POST_TOWN { get; set; }
            public string POSTCODE { get; set; }
            public string RPC { get; set; }
            public float X_COORDINATE { get; set; }
            public float Y_COORDINATE { get; set; }
            public string STATUS { get; set; }
            public string LOGICAL_STATUS_CODE { get; set; }
            public string CLASSIFICATION_CODE { get; set; }
            public string CLASSIFICATION_CODE_DESCRIPTION { get; set; }
            public int LOCAL_CUSTODIAN_CODE { get; set; }
            public string LOCAL_CUSTODIAN_CODE_DESCRIPTION { get; set; }
            public string COUNTRY_CODE { get; set; }
            public string COUNTRY_CODE_DESCRIPTION { get; set; }
            public string POSTAL_ADDRESS_CODE { get; set; }
            public string POSTAL_ADDRESS_CODE_DESCRIPTION { get; set; }
            public string BLPU_STATE_CODE { get; set; }
            public string BLPU_STATE_CODE_DESCRIPTION { get; set; }
            public string TOPOGRAPHY_LAYER_TOID { get; set; }
            public string WARD_CODE { get; set; }
            public string PARISH_CODE { get; set; }
            public string LAST_UPDATE_DATE { get; set; }
            public string ENTRY_DATE { get; set; }
            public string BLPU_STATE_DATE { get; set; }
            public string LANGUAGE { get; set; }
            public float MATCH { get; set; }
            public string MATCH_DESCRIPTION { get; set; }
            public string DELIVERY_POINT_SUFFIX { get; set; }
        }
        public class LPI
        {
            public string UPRN { get; set; }
            public string ADDRESS { get; set; }
            public string USRN { get; set; }
            public string LPI_KEY { get; set; }
            public string SAO_TEXT { get; set; }
            public string PAO_START_NUMBER { get; set; }
            public string STREET_DESCRIPTION { get; set; }
            public string TOWN_NAME { get; set; }
            public string ADMINISTRATIVE_AREA { get; set; }
            public string POSTCODE_LOCATOR { get; set; }
            public string RPC { get; set; }
            public float X_COORDINATE { get; set; }
            public float Y_COORDINATE { get; set; }
            public string STATUS { get; set; }
            public string LOGICAL_STATUS_CODE { get; set; }
            public string CLASSIFICATION_CODE { get; set; }
            public string CLASSIFICATION_CODE_DESCRIPTION { get; set; }
            public int LOCAL_CUSTODIAN_CODE { get; set; }
            public string LOCAL_CUSTODIAN_CODE_DESCRIPTION { get; set; }
            public string COUNTRY_CODE { get; set; }
            public string COUNTRY_CODE_DESCRIPTION { get; set; }
            public string POSTAL_ADDRESS_CODE { get; set; }
            public string POSTAL_ADDRESS_CODE_DESCRIPTION { get; set; }
            public string BLPU_STATE_CODE { get; set; }
            public string BLPU_STATE_CODE_DESCRIPTION { get; set; }
            public string TOPOGRAPHY_LAYER_TOID { get; set; }
            public string WARD_CODE { get; set; }
            public string LAST_UPDATE_DATE { get; set; }
            public string ENTRY_DATE { get; set; }
            public string BLPU_STATE_DATE { get; set; }
            public string LPI_LOGICAL_STATUS_CODE { get; set; }
            public string LPI_LOGICAL_STATUS_CODE_DESCRIPTION { get; set; }
            public string LANGUAGE { get; set; }
            public float MATCH { get; set; }
            public string MATCH_DESCRIPTION { get; set; }
            public string PAO_TEXT { get; set; }
            public string PAO_START_SUFFIX { get; set; }
            public string ORGANISATION { get; set; }
            public string PAO_END_NUMBER { get; set; }
            public string PARENT_UPRN { get; set; }
        }

    }
}


