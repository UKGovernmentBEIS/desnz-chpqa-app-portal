using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using WebApi.Contracts;
using WebApi.Model;
using static WebApi.Model.Person;

namespace WebApi.Functions
{
    public class SubmissionEditabilityService
    {
        public static async Task<bool> CanSubmissionBeEdited(Guid? idSubmission, ServiceClient service, ILogger logger, int Role = (int)UserType.ResponsiblePerson)
        {
            ReplyMessage reply = new ReplyMessage();

            // get Submission
            Entity resultSubmission = await service.RetrieveAsync("desnz_submission", idSubmission ?? Guid.Empty, new ColumnSet(true));

            int submissionStatus = resultSubmission.GetAttributeValue<OptionSetValue>("desnz_status").Value;

            // TODO update roles and submission status editability
            // better do the if else by status and then by role ? TBD

            if (Role == (int)UserType.ResponsiblePerson)
            {
                if (submissionStatus == (int)Submission.SubmissionStatus.InProgress || submissionStatus == (int)Submission.SubmissionStatus.NotStarted || submissionStatus == (int)Submission.SubmissionStatus.ReturnedForChanges || submissionStatus == (int)Submission.SubmissionStatus.ReturnToRPFromAA)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else if (Role == (int)UserType.TechnicalAssessor)
            {
                if (submissionStatus == (int)Submission.SubmissionStatus.Submitted)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else if (Role == (int)UserType.TechnicalAssessor2)
            {
                if (submissionStatus == (int)Submission.SubmissionStatus.Approved || submissionStatus == (int)Submission.SubmissionStatus.Rejected)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else if (Role == (int)UserType.AssessorAdmin)
            {
                if (submissionStatus == (int)Submission.SubmissionStatus.Unassinged)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }
    }
}
