using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestUpdSubmROCSCertif
    {
        [Required]
        public Guid? idSubmission { get; set; }
        [Required]
        public bool? rocsCertificate { get; set; }        //desnz_needanrenewablesobligationcertificate
    }
}
