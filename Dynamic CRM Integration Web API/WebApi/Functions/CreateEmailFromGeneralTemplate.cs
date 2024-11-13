using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Notify.Client;
using WebApi.Services;

namespace WebApi.Functions
{

    /// <summary>
    /// An Interface in order to use as a reference and late bind to the appropriate instance.
    /// For the momment only one concrete implementation exists. Consider creating a factory if you want to bind it to a new implementation!
    /// The purpose is to provide the contract of behavior of creating (and send) an Email using a general template.
    /// The general template uses dynamic fields of subject, header, body and footer (optional)
    /// </summary>
    public interface IEmailFromGeneralTemplate
    {
        public string BuildSubject(string subject, Dictionary<string, string>? SubjectPlaceholders);
        public string BuildHeader(string header, Dictionary<string, string>? HeaderPlaceholders);
        public string BuildBody(string body, Dictionary<string, string>? BodyPlaceholders);
        public string? BuildFooter(string? footer, Dictionary<string, string>? FooterPlaceholders);
        public Dictionary<string, dynamic> BuildEmailFromData(string subject, string header, string body, string? footer);
        public bool SendGeneralEmail(Dictionary<string, dynamic> TemplatePlaceholdersData);
    }
    /// <summary>
    /// A concrete implementation of EmailFromGeneralTemplate.
    /// <list type="table">
    /// <listheader>
    /// <term>methods</term>
    /// <description>
    /// The class have the following behavior
    /// </description>
    /// </listheader>
    /// <item><term>BuildSubject</term>
    /// <description>BuildSubject receives a string which can have templated placeholders and a Dictionary where each placehold (string) is replaced by a string  </description>
    /// </item>
    /// <item><term>BuildHeader</term>
    /// <description>BuildHeader receives a string which can have templated placeholders and a Dictionary where each placehold (string) is replaced by a string</description>
    /// </item>
    /// <item><term>BuildBody</term>
    /// <description>BuildBody receives a string which can have templated placeholders and a Dictionary where each placehold (string) is replaced by a string</description>
    /// </item>
    /// <item><term>BuildFooter</term>
    /// <description>BuildSubject receives a string which can have templated placeholders and a Dictionary where each placehold (string) is replaced by a string
    /// This method can have input null in both params
    /// </description>
    /// </item>
    /// <item><term>BuildEmailFromData</term>
    /// <description>BuildEmailFromData receives 4 strings and a Dictionary where each placehold (string) is replaced by a string.
    /// Normaly it receives the returns of the previous methods.
    /// </description>
    /// <returns>It returns a Dictionary string,string which is a dictionary with subject, header, body, footer placeholders of template to replace</returns>
    /// </item>
    /// <item>
    /// <term> SendGeneralEmail </term>
    /// <description>SendGeneralEmail finaly sends the email using Gov.UK notify service. It receives the previous Dictionary as input</description>
    /// </item>
    /// </list>
    /// </summary>
    public class CreateEmailFromGeneralTemplate: IEmailFromGeneralTemplate
    {
        private Dictionary<string, string> _dataPlaceholders;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private IServiceClientFactory _serviceClientFactory;
        public string EmailAddress { get; set; }

        public CreateEmailFromGeneralTemplate(IConfiguration configuration, ILogger logger, string EmailAddressPass) {
            _configuration = configuration;
            _logger = logger;
            EmailAddress = EmailAddressPass;
        }
        public string BuildSubject(string subject, Dictionary<string, string> SubjectPlaceholders)
        {
            return SubjectPlaceholders?.Select(x => subject=subject.Replace(x.Key, x.Value)).Take(SubjectPlaceholders.Count()).Last() ?? subject;
        }

        public string BuildHeader(string header, Dictionary<string, string>? HeaderPlaceholders) {
            return HeaderPlaceholders?.Select(x => header=header.Replace(x.Key, x.Value)).Take(HeaderPlaceholders.Count()).Last() ?? header;
        }
        public string BuildBody(string body, Dictionary<string, string>? BodyPlaceholders) {
            return BodyPlaceholders?.Select(x => body=body.Replace(x.Key, x.Value)).Take(BodyPlaceholders.Count()).Last() ?? body;
        }
        public string? BuildFooter(string? footer, Dictionary<string, string>? FooterPlaceholders) {
            return FooterPlaceholders?.Select(x => footer=footer?.Replace(x.Key, x.Value)).Take(FooterPlaceholders.Count()).Last() ?? null;
        }
        public Dictionary<string, dynamic> BuildEmailFromData(string subject, string header, string body, string? footer)
        { return new Dictionary<string, dynamic>() {
            { "subject", subject },
            { "header", header },
            { "body", body },
            {"footer", footer ?? ""}
                }; 
        }

              
        public bool SendGeneralEmail(Dictionary<string, dynamic> TemplatePlaceholdersData)
        {
            var client = new NotificationClient(_configuration["GovUKNotifyApiKey"]);
            
            try
            {
                var response = client.SendEmail(
                        emailAddress: EmailAddress,
                        templateId: _configuration["GovUKGenericTemplateWithHeaderAndFooter"],
                        TemplatePlaceholdersData
                        );
                return !string.IsNullOrEmpty(response?.id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }
        }
    }
}
