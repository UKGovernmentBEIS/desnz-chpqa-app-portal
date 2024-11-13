using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestAssessmentDecision
    {
        [Required]
        public Guid submissionId { get; set; }    
        public Guid? assessmentDecisionId { get; set; } //desnz_assessmentdecisionIid
        [Required]
        public bool? certifyChoice { get; set; } //desnz_choice
        public DateTime? dateOfCertification { get; set; } //desnz_dateofcertification
        public string? comments { get; set; } //desnz_comments

    }
}
