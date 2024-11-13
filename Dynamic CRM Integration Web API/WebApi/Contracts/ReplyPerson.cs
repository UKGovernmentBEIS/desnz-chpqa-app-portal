﻿using WebApi.Model;

namespace WebApi.Contracts
{
    public class ReplyPerson                    // contact
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
        public string? telephone1 { get; set; }         // address1_telephone1
        public string? telephone2 { get; set; }         // address1_telephone2
        public ReplyOrganisation? organisation { get; set; }         // parentcustomerid
    }
}
