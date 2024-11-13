using Notify.Client;
using WebApi.Contracts;

namespace WebApi.Functions
{
    public class SendEmail
    {

        private readonly string _GovUKNotifyApiKey;

        public SendEmail(IConfiguration configuration)
        {
            this._GovUKNotifyApiKey = configuration["GovUKNotifyApiKey"];
        }

        public async Task<string> SendEmailWithTemplate(string templatefilepath, string ContactName, string Scheme_Name, string Email)
        {
                // Define the placeholder to be replaced
                string Name = "name";

                string Schemename = "schemename";

                var client = new NotificationClient(_GovUKNotifyApiKey);

                var response = client.SendEmail(
                   emailAddress: Email,
                //templateId: "38ab553e-9dd5-4f8f-88e1-bd2374d829e1"
                   templateId: templatefilepath,
                   new Dictionary<string, dynamic> {
                       { Schemename, Scheme_Name},
                       { Name, ContactName }
                       //{ placeholder, linkPlusToken },
                       //{ sectionCommentListPlaceholder, sectionCommentLine }
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
    }
}
