using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using System.Net.Http.Headers;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class GetCompanyInformation : ControllerBase
    {
        private readonly ILogger<GetCompanyInformation> _logger;
      
        private readonly string _companyInfoApiKey;
        private readonly string _companyInfoBaseUrl;
        private readonly IServiceClientFactory _serviceClientFactory;

        public GetCompanyInformation(IConfiguration configuration, ILogger<GetCompanyInformation> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _companyInfoApiKey = configuration["CompanyInfoApiKey"];
            _companyInfoBaseUrl = configuration["CompanyInfoBaseUrl"];
            _serviceClientFactory = serviceClientFactory;
        }
        [HttpGet("GetCompanyInformation")]
        [SwaggerOperation(Summary = "Get Company Information", Description = "Get Company Information")]
        [AllowAnonymous]
        public async Task<ActionResult> GetCompanyInfo(string companyNumber)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    // Set the base address
                    client.BaseAddress = new Uri(_companyInfoBaseUrl);

                    // Set the Authorization header
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{_companyInfoApiKey}:")));

                    // Make the GET request
                    HttpResponseMessage response = await client.GetAsync($"/company/{companyNumber}");

                    

                    if (response.IsSuccessStatusCode)
                    {
                        // Read and display the response body
                        string responseBody = await response.Content.ReadAsStringAsync();

                        return Ok(responseBody);
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
    }
}
