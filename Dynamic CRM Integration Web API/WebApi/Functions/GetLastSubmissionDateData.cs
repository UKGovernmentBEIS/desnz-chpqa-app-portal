using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk;
using WebApi.Contracts;
using WebApi.Services;

namespace WebApi.Functions
{
    /// <summary>
    /// This is an interface to provide a hook for implementing different check
    /// classes that should implement a function for checking if a background task should start or not
    /// and maybe initialize and invalidate the trigger
    /// </summary>
    public interface ITaskStartChecker
    {
        public Task<bool> TaskShouldStart();
        public Task InitializeTrigger();
        public Task InvalidateTrigger();
    }

    /// <summary>
    /// This is an implementation for our current trigger for bulk email sending
    /// </summary>
    public class TaskStartChecker : ITaskStartChecker
    {
        private readonly IServiceClientFactory _serviceClientFactory;
        private ReplySubmDueDateConf _submDueDate;
        private Guid _entityId;
        public TaskStartChecker(IServiceClientFactory serviceClientFactory)
        {
            _serviceClientFactory = serviceClientFactory;
            _submDueDate = new ReplySubmDueDateConf();
        }
        public async Task<bool> TaskShouldStart()
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {

                QueryExpression relatedquery = new QueryExpression
                {
                    EntityName = "desnz_configurations", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("desnz_lastsubmissiondate","desnz_lastsubmissiondateemailalreadysend")
                };


                EntityCollection SubmDueDate_E = await serviceClient.RetrieveMultipleAsync(relatedquery);

                if (SubmDueDate_E.Entities.Count > 0)
                {
                    _entityId=SubmDueDate_E[0].Id;
                    _submDueDate.submDueDate = SubmDueDate_E.Entities[0].GetAttributeValue<DateTime>("desnz_lastsubmissiondate");
                    _submDueDate.hasSendNotificationsFromLastUpdate = SubmDueDate_E.Entities[0].GetAttributeValue<bool>("desnz_lastsubmissiondateemailalreadysend");
                }
                return ((_submDueDate.hasSendNotificationsFromLastUpdate ?? false) is false && (((_submDueDate.submDueDate?.Date ?? DateTime.Now.Date) - DateTime.Now.Date).Days <= 14));
            }

        }

        private async Task BulkEmailHasRunFlagUpdate(bool v)
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {
                Entity change_E = new Entity("desnz_configurations");
                change_E.Id = _entityId;
                change_E["desnz_lastsubmissiondateemailalreadysend"] = v;
                await serviceClient.UpdateAsync(change_E);
            }
        }

        public async Task InitializeTrigger()
        {
           await BulkEmailHasRunFlagUpdate(false);
        }

        public async Task InvalidateTrigger()
        {
            await BulkEmailHasRunFlagUpdate(true);

        }
    }

    /// <summary>
    /// Interfaces in order to make the Trigger date more dynamically.
    /// </summary>
    /// <remarks>
    /// Unfortunately needs more abstraction and it would be best if it had 
    /// Dependency Inversion implemented for ServiceClient
    /// </remarks>
    public interface ITaskGetOffsetStart
    {
        public Task<int> GetOffsetNumber();
    }

    /// <summary>
    /// Interfaces in order to make the Trigger date more dynamically.
    /// We use it in order to assign an implementation of getting the trigger date
    /// from dataverse
    /// For the moment the only concrete implementation is <see cref="TaskGetStartDate"/>
    /// </summary>
    /// <remarks>
    /// Unfortunately needs more abstraction and it would be best if it had 
    /// Dependency Inversion implemented for ServiceClient
    /// </remarks>
    public interface ITaskGetStartDate
    {
        public Task<DateTime> GetStartDate();
        public Task<DateTime> ProvideLastSubmissionDate();
       
    }

    public class TaskGetStartDate : ITaskGetOffsetStart, ITaskGetStartDate
    {
        private readonly IServiceClientFactory _serviceClientFactory;
        private int _offsetNum;
        private DateTime _LastSubmissionDate;

        public TaskGetStartDate(IServiceClientFactory serviceClientFactory)
        {
            _serviceClientFactory = serviceClientFactory;
        }
        public TaskGetStartDate(IServiceClientFactory serviceClientFactory, int offsetNum)
        {
            _serviceClientFactory = serviceClientFactory;
            _offsetNum = offsetNum;

        }

        public async Task<int> GetOffsetNumber()
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {

                QueryExpression relatedquery = new QueryExpression
                {
                    EntityName = "desnz_configurations", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("desnz_lastsubmissiondatetimeslotbegin")
                };


                EntityCollection SubmDueDate_E = await serviceClient.RetrieveMultipleAsync(relatedquery);

                if (SubmDueDate_E.Entities.Count > 0)
                {
                    _offsetNum = SubmDueDate_E.Entities[0].GetAttributeValue<int>("desnz_lastsubmissiondateemailalreadysend");
                }
                return _offsetNum;
            }
        }

        private async Task<EntityCollection> GetLastSubmDateData()
        {
            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {

                QueryExpression relatedquery = new QueryExpression
                {
                    EntityName = "desnz_configurations", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("desnz_lastsubmissiondate")
                };


                return await serviceClient.RetrieveMultipleAsync(relatedquery);
            }
        }
        public async Task<DateTime> GetStartDate()
        {
            


                EntityCollection SubmDueDate_E = await GetLastSubmDateData();

                if (SubmDueDate_E.Entities.Count > 0)
                {
                    _LastSubmissionDate = SubmDueDate_E.Entities[0].GetAttributeValue<DateTime>("desnz_lastsubmissiondate");
                }
                return _LastSubmissionDate.Date.AddMinutes(Convert.ToDouble(await this.GetOffsetNumber()));
            
        }

        public async Task<DateTime> ProvideLastSubmissionDate()
        {
                EntityCollection SubmDueDate_E = await GetLastSubmDateData();

                if (SubmDueDate_E.Entities.Count > 0)
                {
                    _LastSubmissionDate = SubmDueDate_E.Entities[0].GetAttributeValue<DateTime>("desnz_lastsubmissiondate");
                }
                return _LastSubmissionDate;
            
        } 
    }
}
