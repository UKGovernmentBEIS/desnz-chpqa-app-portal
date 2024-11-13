namespace WebApi.Model
{

    /*
     * We do not use this!!
     * Organisation field is customer so it can be both Account or Contact
     * 
    public class Organisation //contact
    {
        //do not need to set ID for create
        public Guid? id { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public string emailaddress1 { get; set; }     
        public string jobtitle { get; set; }
        public string address1_name { get; set; }
        public string address1_postalcode { get; set; }
        public string address1_telephone1 { get; set; }
        public string address1_telephone2 { get; set; }
        public string address1_city { get; set; }
        public string address1_county { get; set; }
    }
    */


    public class Organisation                                   // account
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
