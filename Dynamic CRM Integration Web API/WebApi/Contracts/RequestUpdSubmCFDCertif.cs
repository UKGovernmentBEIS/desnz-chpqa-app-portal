using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestUpdSubmCFDCertif
    {
        [Required]
        public Guid? idSubmission { get; set; }
        
        [Required]
        public bool? cfdCertificate { get; set; }        //desnz_needacontractsfordifferencecertificate
    }
}
