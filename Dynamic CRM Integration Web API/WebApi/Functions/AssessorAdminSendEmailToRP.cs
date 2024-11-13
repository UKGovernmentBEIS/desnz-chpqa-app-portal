using Notify.Client;
using WebApi.Model;

namespace WebApi.Functions
{
    public class AssessorAdminSendEmailToRP
    {
        private static string _GovUKNotifyApiKey;
        private static string _GovUKAssignSecondAssessorReturned;
        private readonly string _loginPageLink;


        public AssessorAdminSendEmailToRP(IConfiguration configuration)
        {
            _GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"]; //Environment.GetEnvironmentVariable("SendGridApiKey");
            _GovUKAssignSecondAssessorReturned = configuration["GovUKAssignSecondAssessorReturned"];
            _loginPageLink = configuration["LoginPage"];
        }

        public async Task SendEmailToRP(
           string contactName, string SchemeName, string SchemeReference, string AssessorName, string Email, string comments)
        {
            EmailInfo emailInfo = new EmailInfo();
            emailInfo = CreateProperEmail(); //Gets body and subject

            string BodyPlaceholder = "BODY";


            // Define the placeholder to be replaced
            string NamePlaceholder = "NAME"; //contactName

            string SchemenamePlaceholder = "[SCHEME NAME]";

            string replacedHtml = emailInfo.body.Replace(SchemenamePlaceholder, SchemeName);

            string SchemeRefPlaceholder = "[SCHEME REF]";

            replacedHtml = replacedHtml.Replace(SchemeRefPlaceholder, SchemeReference);

            string assessorAdminNamePlaceholder = "[ASSESSOR ADMIN NAME]";

            replacedHtml = replacedHtml.Replace(assessorAdminNamePlaceholder, AssessorName);

            string commentsPlaceholder = "SECTION_COMMENT_LIST";

            // Define the placeholder to be replaced
            string placeholder = "dynamicLink";

            // The dynamic value you want to replace
            string linkPlusToken = _loginPageLink;


            var client = new NotificationClient(_GovUKNotifyApiKey);
            var response = client.SendEmail(
               emailAddress: Email,
               templateId: _GovUKAssignSecondAssessorReturned.ToString(),
               new Dictionary<string, dynamic> {
                       { NamePlaceholder, contactName },
                       { BodyPlaceholder, replacedHtml},
                       { placeholder, linkPlusToken },
                       { commentsPlaceholder, comments }
               }
           );
        }

        public EmailInfo CreateProperEmail()
        {
            EmailInfo emailInfo = new EmailInfo();
            emailInfo.body = "The scheme [SCHEME NAME] [SCHEME REF] has been returned to you for changes or to answer queries by [ASSESSOR ADMIN NAME].\n"
                + "\nSign in to your account to view this request.\n";
            emailInfo.subject = "Combined Heat and Power Quality Assurance programme: scheme returned to RP";

            return emailInfo;
        }

    }
}
