
namespace WebApi.Model
{
    public class Scheme                             // desnz_scheme
    {
        //do not need to set ID for create
        public Guid? id { get; set; }                                   // desnz_schemeid
        public string? name { get; set; }                               // desnz_name
        public string? reference { get; set; }                          // desnz_reference
        public DateTime? createdon { get; set; }                        // createdon
        public int? status { get; set; }                                // desnz_schemestatus
        public int? latestSubmissionStatus { get; set; }                // desnz_latestsubmissionstatus
        public string? statusText { get; set; }                         // 
        public Organisation? company { get; set; }                      // desnz_company
        public Person? responsiblePerson { get; set; }                  // desnz_responsibleperson
        public SchemeLocationDetails? site { get; set; }                // desnz_schemelocationdetails
        public Policy? policyRocs { get; set; }                         // desnz_policyrocs
        public Policy? policyChpqa { get; set; }                        // desnz_policychpqa
        public EconomicSector? econSector {  set; get; }                 // desnz_ecosector
        public EconomicSubSector? econSubSector {  set; get; }           // desnz_ecosubsector
        public SicCode? sicCode { get; set; }                            // desnz_siccode

    }
}
