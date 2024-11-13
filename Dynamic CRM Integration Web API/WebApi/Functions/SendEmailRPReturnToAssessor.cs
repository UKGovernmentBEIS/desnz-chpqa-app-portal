using Notify.Client;
using WebApi.Model;

namespace WebApi.Functions
{
    public class SendEmailRPReturnToAssessor
    {
        private static string _GovUKNotifyApiKey;
        private static string _RPReturnToAssessorTemplate;
        private readonly string _loginPageLink;

        public SendEmailRPReturnToAssessor(IConfiguration configuration)
        {
            _GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"]; //Environment.GetEnvironmentVariable("SendGridApiKey");
            _RPReturnToAssessorTemplate = configuration["GovUKRPReturnToAssessorTemplate"];
            _loginPageLink = configuration["LoginPage"];
        }

        public async Task<bool> SendEmailReturnToAssessor(
           string contactName, string SchemeName, string SchemeReference, string AssessorName, string Email, string? comments)
        {

            if (comments == null)
            {
                comments = "";
            }

            EmailInfo emailInfo = CreateProperEmail();

            string BodyPlaceholder = "BODY";

            // Define the placeholder to be replaced
            string NamePlaceholder = "NAME"; //contactName

            string SchemenamePlaceholder = "[SCHEME NAME]";

            string replacedHtml = emailInfo.body.Replace(SchemenamePlaceholder, SchemeName);

            string SchemeRefPlaceholder = "[SCHEME REF]";

            replacedHtml = replacedHtml.Replace(SchemeRefPlaceholder, SchemeReference);

            string assessorNamePlaceholder = "[ASSESSOR NAME]";
            
            replacedHtml = replacedHtml.Replace(assessorNamePlaceholder, AssessorName);

            string CommentsPlaceholder = "COMMENTS";


            // Define the placeholder to be replaced
            string placeholder = "dynamicLink";

            // The dynamic value you want to replace
            string linkPlusToken = _loginPageLink;

            var client = new NotificationClient(_GovUKNotifyApiKey);
            var response = client.SendEmail(
               emailAddress: Email,
               templateId: _RPReturnToAssessorTemplate,
               new Dictionary<string, dynamic> {
                       { NamePlaceholder, contactName },
                       { BodyPlaceholder, replacedHtml},
                       { placeholder, linkPlusToken },
                       { CommentsPlaceholder, comments }
                   }
               );

            return true;

        }

        public static EmailInfo CreateProperEmail()
        {
            EmailInfo emailInfo = new EmailInfo();

            emailInfo.subject = "Combined Heat and Power Quality Assurance programme: scheme returned to assessor";
            emailInfo.body = "The scheme [SCHEME NAME] [SCHEME REF] has been returned to [ASSESSOR NAME]";

            return emailInfo;
        }

    }


}
