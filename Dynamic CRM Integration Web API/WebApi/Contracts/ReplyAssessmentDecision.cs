namespace WebApi.Contracts
{
    public class ReplyAssessmentDecision
    {    
        public Guid? assessmentDecisionId { get; set; } //desnz_assessmentdecisionIid
        public bool? certifyChoice { get; set; } //desnz_choice
        public DateTime? dateOfCertification { get; set; } //desnz_dateofcertification
        public string? comments { get; set; } //desnz_comments
    }
}
