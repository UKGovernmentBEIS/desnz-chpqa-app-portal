namespace WebApi.Contracts
{
    public class ReplyAuditRec
    {    
        public Guid? auditRecId { get; set; } 
        public bool? isRecommended { get; set; } //desnz_isrecommended
        public bool? technicalPerformanceConcerns { get; set; } //desnz_technicalperformanceconcerns
        public bool? complianceConcerns { get; set; } //desnz_complianceconcerns
        public string? comments { get; set; } //desnz_comments
    }
}
