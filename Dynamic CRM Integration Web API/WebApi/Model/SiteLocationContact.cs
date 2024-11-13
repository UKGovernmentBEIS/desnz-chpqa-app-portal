namespace WebApi.Model
{
    public class SiteLocationContact                    // desnz_sitelocationcontact
    {
        public Guid? id { get; set; }                   // desnz_sitelocationcontactid
        public string? firstName { get; set; }          // desnz_name
        public string? lastName { get; set; }           // desnz_lastname
        public string? email { get; set; }              // desnz_email
        public string? jobTitle { get; set; }           // desnz_jobtitle
        public string? telephone1 { get; set; }         // desnz_telephone1
        public string? telephone2 { get; set; }         // desnz_telephone2

    }
}
