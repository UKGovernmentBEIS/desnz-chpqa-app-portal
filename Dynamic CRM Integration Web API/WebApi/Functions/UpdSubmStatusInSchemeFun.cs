using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace WebApi.Functions
{

    public static class UpdSubmStatusInSchemeFun
    {
        public static async Task UpdSubmStatusInScheme(Guid? idSubmission, int submissionStatus, ServiceClient service, ILogger logger)
        {
            // get Submission
            Entity resultSubmission = await service.RetrieveAsync("desnz_submission", idSubmission ?? Guid.Empty, new ColumnSet("desnz_submissionid", "desnz_name", "desnz_status", "desnz_scheme"));

            // update submission Status
            resultSubmission["desnz_status"] = new OptionSetValue(submissionStatus);

            await service.UpdateAsync(resultSubmission);

            logger.LogInformation("Updated Submission Status at {DT} of Submission with id :  {id}", DateTime.UtcNow.ToLongTimeString(), idSubmission.ToString());

            // get Scheme Id and 
            if (resultSubmission.Attributes.Contains("desnz_scheme") && resultSubmission["desnz_scheme"] != null)
            {
                EntityReference schemeEntityRef = null;

                schemeEntityRef = resultSubmission["desnz_scheme"] as EntityReference;
                Guid schemeId = schemeEntityRef == null ? Guid.Empty : schemeEntityRef.Id;
                string schemeName = schemeEntityRef?.Name ?? string.Empty;

                // update latest Submission status of Scheme
                Entity scheme = new Entity("desnz_scheme", schemeId);
                scheme["desnz_latestsubmissionstatus"] = new OptionSetValue(submissionStatus);

                await service.UpdateAsync(scheme);

                logger.LogInformation("Updated Latest Submission Status at {DT} of Scheme with id :  {id}", DateTime.UtcNow.ToLongTimeString(), schemeId.ToString());

            }

        }
        public static async Task UpdSubmStatusAndTA2InScheme(Guid? idSubmission, Guid idTA2, int submissionStatus, ServiceClient service, ILogger logger)
        {
            // get Submission
            Entity resultSubmission = await service.RetrieveAsync("desnz_submission", idSubmission ?? Guid.Empty, new ColumnSet("desnz_submissionid", "desnz_name", "desnz_status", "desnz_scheme"));

            // update submission Status
            resultSubmission["desnz_status"] = new OptionSetValue(submissionStatus);

            await service.UpdateAsync(resultSubmission);

            logger.LogInformation("Updated Submission Status at {DT} of Submission with id :  {id}", DateTime.UtcNow.ToLongTimeString(), idSubmission.ToString());

            // get Scheme Id and 
            if (resultSubmission.Attributes.Contains("desnz_scheme") && resultSubmission["desnz_scheme"] != null)
            {
                EntityReference schemeEntityRef = null;

                schemeEntityRef = resultSubmission["desnz_scheme"] as EntityReference;
                Guid schemeId = schemeEntityRef == null ? Guid.Empty : schemeEntityRef.Id;
                string schemeName = schemeEntityRef?.Name ?? string.Empty;

                // update latest Submission status of Scheme
                Entity scheme = new Entity("desnz_scheme", schemeId);
                scheme["desnz_latestsubmissionstatus"] = new OptionSetValue(submissionStatus);

                // if ta2 id is empty do not make reference
                if (idTA2 != Guid.Empty)
                {
                    scheme["desnz_secondassessor"] = new EntityReference("contact", idTA2);
                }

                await service.UpdateAsync(scheme);

                logger.LogInformation("Updated Latest Submission Status at {DT} of Scheme with id :  {id}", DateTime.UtcNow.ToLongTimeString(), schemeId.ToString());

            }

        }
    }

}
