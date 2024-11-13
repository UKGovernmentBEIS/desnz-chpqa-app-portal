using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestAuditRec
    {
        [Required]
        public Guid submissionId { get; set; }    
        public Guid? auditRecId { get; set; }
        [Required]
        public bool? isRecommended { get; set; } //desnz_isrecommended
        public bool? technicalPerformanceConcerns { get; set; } //desnz_technicalperformanceconcerns
        public bool? complianceConcerns { get; set; } //desnz_complianceconcerns
        public string? comments { get; set; } //desnz_comments

    }
}
