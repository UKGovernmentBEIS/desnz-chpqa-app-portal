namespace WebApi.Contracts
{
    public class ReplySubmDueDateConf
    {    
        public DateTime? submDueDate { get; set; } //desnz_lastsubmissiondate
        public int? triggerNotificationsTimeOffset { get; set; } //desnz_lastsubmissiondatetimeslotbegin
        public bool? hasSendNotificationsFromLastUpdate { get; set; } //desnz_lastsubmissiondateemailalreadysend
    }
}
