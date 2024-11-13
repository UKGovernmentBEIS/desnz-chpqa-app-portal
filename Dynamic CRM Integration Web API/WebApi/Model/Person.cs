namespace WebApi.Model
{
    public class Person             // contact
    {
        public Guid? id { get; set; }                   // contactid
        public string? username { get; set; }           // desnz_username
        public string? password { get; set; }       
        public string? firstName { get; set; }          // firstname
        public string? lastName { get; set; }           // lastname
        public string? email { get; set; }              // emailaddress1
        public string? jobTitle { get; set; }           // jobtitle
        public int? userType { get; set; }              // desnz_usertype
        public bool? consultant { get; set; }           // desnz_consultant
        /*
        public string? address1 { get; set; }           // delete
        public string? address2 { get; set; }           // delete
        public string? town { get; set; }               // delete
        public string? county { get; set; }             // delete
        public string? postcode { get; set; }           // delete
        */
        public string? telephone1 { get; set; }         // address1_telephone1
        public string? telephone2 { get; set; }         // address1_telephone2
        public Organisation? organisation { get; set; }         // parentcustomerid

        public enum UserType
        {
            ResponsiblePerson = 1,
            TechnicalAssessor = 2,
            OptRP = 3,
            Certifier = 4,
            Auditor = 5,
            DelegateRP = 6,
            TechnicalAssessor2 = 7,
            AssessorAdmin = 8,
        }

    }

}
