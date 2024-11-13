namespace WebApi.Contracts
{
    public class ReplyOrganisation                              // account
    {
        public Guid? id { get; set; }                           // accountid
        public string? name { get; set; }                       // name
        public string? registrationNumber { get; set; }         // desnz_registrationnumber
        public string? address1 { get; set; }                   // address1_name
        public string? address2 { get; set; }                   // address2_name
        public string? town { get; set; }                       // address1_city
        public string? county { get; set; }                     // address1_county
        public string? postcode { get; set; }                   // address1_postalcode
    }
}
