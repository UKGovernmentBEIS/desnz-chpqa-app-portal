using Notify.Client;

namespace WebApi.Functions
{
    public class SendRegiEmail
    {
        private static string _GovUKNotifyApiKey;
        private static string _GovUKUserRegistrationTemplate;
        private readonly string _loginPageLink;

        public SendRegiEmail(IConfiguration configuration)
        {
            _GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"]; //Environment.GetEnvironmentVariable("SendGridApiKey");
            _GovUKUserRegistrationTemplate = configuration["GovUKUserRegistrationTemplate"];
            _loginPageLink = configuration["LoginPage"];
        }

        public async Task<bool> SendRegEmail(string contactName, string Email)
        {
            // Define the placeholder to be replaced
            string NamePlaceholder = "NAME"; //contactName

            string emailPlaceholder = "email";

            // Define the placeholder to be replaced
            string placeholder = "dynamicLink";

            // The dynamic value you want to replace
            string linkPlusToken = _loginPageLink;

            var client = new NotificationClient(_GovUKNotifyApiKey);
            var response = client.SendEmail(
               emailAddress: Email,
               templateId: _GovUKUserRegistrationTemplate,
               new Dictionary<string, dynamic> {
                       { NamePlaceholder, contactName },
                       { placeholder, linkPlusToken },
                       { emailPlaceholder, Email}
                   }
               );
            return true;
        }
    }
}
