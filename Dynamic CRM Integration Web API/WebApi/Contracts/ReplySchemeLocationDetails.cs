namespace WebApi.Contracts
{
    public class ReplySchemeLocationDetails
    {
        public Guid? id { get; set; }                       // desnz_schemelocationdetailsid
        public string? name { get; set; }                   // desnz_name
        public string? address1 { get; set; }               // desnz_address1
        public string? address2 { get; set; }               // desnz_address2
        public string? postcode { get; set; }               // desnz_postcode
        public string? town { get; set; }                   // desnz_town
        public string? county { get; set; }                 // desnz_county
        public string? instructions { get; set; }           // desnz_instructions
        public bool? areYouTheSiteContactPerson { get; set; }           // desnz_areyouthesitecontactperson
        //public ReplyPerson contactPerson { get; set; }          // desnz_sitecontact
        public ReplySiteLocationContact contactPerson { get; set; }     // desnz_sitelocationcontact
    }
}
