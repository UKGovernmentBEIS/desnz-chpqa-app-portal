using System.ComponentModel.DataAnnotations;

namespace WebApi.Contracts
{
    public class RequestSchemeLocationDetails
    {
        [Required]
        public string? address1 { get; set; }               // desnz_address1
        public string? address2 { get; set; }               // desnz_address2
        [Required]
        public string? postcode { get; set; }               // desnz_postcode
        [Required]
        public string? town { get; set; }                   // desnz_town
        public string? county { get; set; }                 // desnz_county
    }
}
