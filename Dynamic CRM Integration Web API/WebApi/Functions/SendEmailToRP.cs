using Notify.Client;
using Notify.Models;
using Notify.Models.Responses;
using WebApi.Contracts;
using WebApi.Model;
using static WebApi.Controllers.GetAssessCommentsTA1;
using DocumentFormat.OpenXml.Office2016.Excel;
using System.Drawing.Text;

namespace WebApi.Functions
{
    public class SendEmailToRPorTA2
    {
        private static string _GovUKNotifyApiKey;
        private static string _GovUKAssignSecondAssessorReady;
        private static string _GovUKAssignSecondAssessorReturned;
        private static string _GovUKAssignSecondAssessorReject;
        //private static string _sendGridFromEmail;
        private readonly string _loginPageLink;

        public SendEmailToRPorTA2(IConfiguration configuration)
        {
            _GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"]; //Environment.GetEnvironmentVariable("SendGridApiKey");
            //_GovUKAssessorEmailTemplate_Approved = configuration["GovUKAssessorEmailTemplate_Approved"];
            _GovUKAssignSecondAssessorReady = configuration["GovUKAssignSecondAssessorReady"];
            _GovUKAssignSecondAssessorReject = configuration["GovUKAssignSecondAssessorReject"];
            _GovUKAssignSecondAssessorReturned = configuration["GovUKAssignSecondAssessorReturned"];
            //_sendGridFromEmail = configuration["SendGridFromEmail"];
            _loginPageLink = configuration["LoginPage"];

        }

        public async Task<string> SendEmailWithTemplate(int submissionStatus,
            string contactName, string SchemeName, string SchemeReference, string AssessorName, string Email, List<ReplySubmissionGroupCommentsTA1> groupList, string emailBody, string emailSubject)
        {
          

                string BodyPlaceholder = "BODY";

                //string replacedHtml = emailBody.Replace(BodyPlaceholder, emailBody);

                // Define the placeholder to be replaced
                string NamePlaceholder = "NAME"; //contactName

                //string replacedHtml = emailBody.Replace(NamePlaceholder, contactName); //contactName = Recipient

                string TA1NamePlaceholder = "[FIRST ASSESSOR NAME]"; //AssessorName 

                string replacedHtml = emailBody.Replace(TA1NamePlaceholder, AssessorName); //AssessorName = Sender

                string SchemenamePlaceholder = "[SCHEME NAME]";

                replacedHtml = replacedHtml.Replace(SchemenamePlaceholder, SchemeName);

                string SchemeRefPlaceholder = "[SCHEME REF]";

                replacedHtml = replacedHtml.Replace(SchemeRefPlaceholder, SchemeReference);

                string sectionCommentListPlaceholder = "SECTION_COMMENT_LIST";

                // Define the placeholder to be replaced
                string placeholder = "dynamicLink";

                // The dynamic value you want to replace
                string linkPlusToken = _loginPageLink;

                string sectionCommentLine = "";
                foreach (var group in groupList)
                {
                    string sectionName = GetTrimmedSubmittedName(group);
                    string sectionComment = group.AssessmentComment;

                    sectionCommentLine += "\r\n" + sectionName + ": Comment " + sectionComment + "\r\n\r\n---";
                }

                replacedHtml = replacedHtml.Replace(sectionCommentListPlaceholder, sectionCommentLine);

                var client = new NotificationClient(_GovUKNotifyApiKey);
                var response = client.SendEmail(
                   emailAddress: Email,
                   //templateId: "38ab553e-9dd5-4f8f-88e1-bd2374d829e1"
                   templateId: this.selectTemplateByStatus(submissionStatus),
                   new Dictionary<string, dynamic> {
                       { NamePlaceholder, contactName },
                       { BodyPlaceholder, replacedHtml},
                       { placeholder, linkPlusToken },
                       { sectionCommentListPlaceholder, sectionCommentLine }
                   }
               );

                ReplyMessage reply = new ReplyMessage();

                if (response.id is not null)
                {
                    return "Email sent successfully.";
                }
                else
                {
                    return "Failed to send email.";
                }
            
        }

        private static string GetTrimmedSubmittedName(ReplySubmissionGroupCommentsTA1 groupComment)
        {
            try
            {
                string formattedSubmName = string.Empty;
                if (groupComment.submittedName != null)
                {
                    if (groupComment.submittedName.StartsWith("Review "))
                    {
                        string extractedName = groupComment.submittedName.Substring(7); //Remove "Review "
                        formattedSubmName = char.ToUpper(extractedName[0]) + extractedName.Substring(1); //Capitalize first letter leave the rest as is
                    }
                    else
                    {
                        formattedSubmName = groupComment.submittedName; //Group name As-Is
                    }
                }
                return formattedSubmName;
            }
            catch (Exception ex)
            {

                return string.Empty;
            }
        }

        public static string CreateProperEmailBody(int submissionStatus)
        {
            string emailBody = "";
            //Return to RP
            if (submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges) //Return to RP
            {
                emailBody = "\r\n   The scheme [SCHEME NAME] [SCHEME REF] has been returned to you by [FIRST ASSESSOR NAME]." +
                    " You can now review their comments and make changes.   \r\n";
            }
            else if (submissionStatus == (int)Submission.SubmissionStatus.Approved) // Send to TA2 (Approved)
            {
                emailBody = "\r\n      The scheme [SCHEME NAME] [SCHEME REF] has been submitted and sent to you by [FIRST ASSESSOR NAME]. \r\n ";
            }
            else if (submissionStatus == (int)Submission.SubmissionStatus.Rejected) // Send to TA2 (Rejected)
            {
                emailBody = "\r\n      The scheme [SCHEME NAME] [SCHEME REF] has been sent to you by [FIRST ASSESSOR NAME] to confirm its rejection. \r\n   ";
            }
            return emailBody;
        }

        public static string CreateProperEmailSubject(int submissionStatus)
        {
            string emailSubject = "";
            if (submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges) //Return to RP
            {
                emailSubject = "Combined Heat and Power Quality Assurance programme: scheme returned for changes";
            }
            else if (submissionStatus == (int)Submission.SubmissionStatus.Approved)    // Send to TA2 (Approved)
            {
                emailSubject = "Combined Heat and Power Quality Assurance programme: scheme ready for validation";
            }
            else if (submissionStatus == (int)Submission.SubmissionStatus.Rejected)    // Send to TA2 (Rejected)
            {
                emailSubject = "Combined Heat and Power Quality Assurance programme: confirm rejection of scheme";
            }
            return emailSubject;
        }

        private string selectTemplateByStatus(int submissionStatus)
        {
            string selectedTemplate = "";

            switch (submissionStatus)
            {
                case (int)Submission.SubmissionStatus.Approved:
                    selectedTemplate = _GovUKAssignSecondAssessorReady;
                    break;
                case (int)Submission.SubmissionStatus.Rejected:
                    selectedTemplate = _GovUKAssignSecondAssessorReject;
                    break;
                case (int)Submission.SubmissionStatus.ReturnedForChanges:
                    selectedTemplate = _GovUKAssignSecondAssessorReturned;
                    break;
            }
            return selectedTemplate;

        }
    }
}
