namespace WebApi.Contracts
{
    public class ReplySubmissionGroups
    {

        public Guid? id { get; set; }
        public string? name { get; set; }
        public string? submittedName { get; set; }
        public int? groupCategory { get; set; }
        public int? groupType { get; set; }
        public int? status { get; set; }
        public int? assessorStatus { get; set; }
        public int? displayOrder { get; set; }             // desnz_displayorder


    }
}
