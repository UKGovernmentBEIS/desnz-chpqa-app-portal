using Notify.Client;
using Notify.Models;
using Notify.Models.Responses;
using WebApi.Model;
using Notify.Client;


namespace WebApi.Functions
{

      public class SendEmailTA2
    {
        private static string _GovUKNotifyApiKey;
        private static string _UpdAssessmentDecTemplateCertified;
        private static string _UpdAssessmentDecTemplateReturned;
        //private static string _sendGridFromEmail;
        private readonly string _loginPageLink;


        public SendEmailTA2(IConfiguration configuration)
        {
            _GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"]; //Environment.GetEnvironmentVariable("SendGridApiKey");
            _UpdAssessmentDecTemplateCertified = configuration["GovUKUpdAssessmentDecTemplateCertified"];
            _UpdAssessmentDecTemplateReturned = configuration["GovUKUpdAssessmentDecTemplateReturned2nd"];
            _loginPageLink = configuration["LoginPage"];
        }
        public async Task<string?> SendEmailToTA1orRP(bool? TA2Choice,
           string contactName, string SchemeName, string SchemeReference, string AssessorName, string Email, string emailBody, string emailSubject, string comments)
        {

            string BodyPlaceholder = "BODY";

            //string replacedHtml = htmlContent.Replace(BodyPlaceholder, emailBody);

            // Define the placeholder to be replaced
            string NamePlaceholder = "NAME"; //contactName

            //replacedHtml = replacedHtml.Replace(NamePlaceholder, contactName); //contactName = Recipient

            string TA2NamePlaceholder = "[SECOND ASSESSOR NAME]"; //AssessorName 

            string replacedHtml = emailBody.Replace(TA2NamePlaceholder, AssessorName); //AssessorName = Sender

            string SchemenamePlaceholder = "[SCHEME NAME]";

            replacedHtml = replacedHtml.Replace(SchemenamePlaceholder, SchemeName);

            string SchemeRefPlaceholder = "[SCHEME REF]";

            replacedHtml = replacedHtml.Replace(SchemeRefPlaceholder, SchemeReference);

            string CommentsPlaceholder = "COMMENTS";

            //replacedHtml = replacedHtml.Replace(CommentsPlaceholder, comments);

            // Define the placeholder to be replaced
            string placeholder = "dynamicLink";

            // The dynamic value you want to replace
            string linkPlusToken = _loginPageLink;

            //replacedHtml = replacedHtml.Replace(placeholder, _loginPageLink);

            var client = new NotificationClient(_GovUKNotifyApiKey);
            var response = client.SendEmail(
               emailAddress: Email,
               //templateId: "38ab553e-9dd5-4f8f-88e1-bd2374d829e1"
               templateId: TA2Choice is true ? _UpdAssessmentDecTemplateCertified: _UpdAssessmentDecTemplateReturned,
               new Dictionary<string, dynamic> {
                       { NamePlaceholder, contactName },
                       { BodyPlaceholder, replacedHtml},
                       { placeholder, linkPlusToken },
                       { CommentsPlaceholder, comments }
                   }
               );

            return response.id;

        }

      


        public static EmailInfo CreateProperEmail(bool? TA2Choice)
        {
            EmailInfo emailInfo = new EmailInfo();

            //Return to RP
            if (TA2Choice == true) // == 1 == Send to RP
            {
                emailInfo.subject = "Combined Heat and Power Quality Assurance programme: scheme certified";
                emailInfo.body = "The scheme [SCHEME NAME] [SCHEME REF] has been approved by [SECOND ASSESSOR NAME]. " +
                    "Their certificate is available in your account and is also attached to this email.";

            } 
            else //Send to TA1
            {
                emailInfo.subject = "Combined Heat and Power Quality Assurance programme: scheme returned by second assessor";
                emailInfo.body = "The scheme [SCHEME NAME] [SCHEME REF] has been returned to you by [SECOND ASSESSOR NAME].";
            }

            return emailInfo;
        }

    }
}
