using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Security.Claims;
using WebApi.Model;

namespace WebApi.Functions
{
    public class HelperFunctions
    {
        //RP or TA1 (by choice)
        public static async Task<(Person person, string schemeName, string schemeReference)> GetSchemeAndContactInfoAsync(
    ServiceClient serviceClient, Guid? submissionId, bool? certifyChoice)
        {
            if (submissionId == null)
            {
                throw new ArgumentException("Submission ID cannot be null.");
            }

            // Define the query
            QueryExpression query = new QueryExpression
            {
                EntityName = "desnz_submission",
                ColumnSet = new ColumnSet(true),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("desnz_submissionid", ConditionOperator.Equal, submissionId)
                    }
                },
                LinkEntities =
                {
                    new LinkEntity
                    {
                        JoinOperator = JoinOperator.Inner,
                        LinkFromEntityName = "desnz_submission",
                        LinkFromAttributeName = "desnz_scheme",
                        LinkToEntityName = "desnz_scheme",
                        LinkToAttributeName = "desnz_schemeid",
                        Columns = new ColumnSet("desnz_schemeid", "desnz_name", "desnz_reference"),
                        EntityAlias = "Scheme",
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner,
                                LinkFromEntityName = "desnz_scheme",
                                LinkFromAttributeName = "desnz_responsibleperson",
                                LinkToEntityName = "contact",
                                LinkToAttributeName = "contactid",
                                Columns = new ColumnSet("contactid", "desnz_username", "firstname", "lastname", "emailaddress1", "jobtitle", "desnz_usertype", "desnz_consultant", "address1_telephone1",
                                "address1_telephone2"),
                                EntityAlias = "ResponsiblePerson",
                                LinkCriteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                                    }
                                }
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter,
                                LinkFromEntityName = "desnz_scheme",
                                LinkFromAttributeName = "desnz_assessor",
                                LinkToEntityName = "contact",
                                LinkToAttributeName = "contactid",
                                Columns = new ColumnSet("contactid", "desnz_username", "firstname", "lastname", "emailaddress1", "jobtitle", "desnz_usertype", "desnz_consultant", "address1_telephone1",
                                "address1_telephone2"),
                                EntityAlias = "Assessor"
                            }
                        }
                    }
                }
            };

            // Retrieve the results
            EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

            // Initialize variables
            Person personToReturn = new Person();
            string schemeName = "";
            string schemeReference = "";

            if (results.Entities.Count > 0)
            {
                // Fetch scheme information
                AliasedValue schemeNameValue = results.Entities[0].GetAttributeValue<AliasedValue>("Scheme.desnz_name");
                AliasedValue schemeReferenceValue = results.Entities[0].GetAttributeValue<AliasedValue>("Scheme.desnz_reference");

                if (schemeNameValue != null) schemeName = schemeNameValue.Value.ToString();
                if (schemeReferenceValue != null) schemeReference = schemeReferenceValue.Value.ToString();

                // Fetch Responsible Person (RP) information
                AliasedValue rpID = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.contactid");
                AliasedValue rpFirstName = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.firstname");
                AliasedValue rpLastName = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.lastname");
                AliasedValue rpUserName = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.desnz_username");
                AliasedValue rpEmail = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.emailaddress1");
                AliasedValue rpTelephone1 = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.address1_telephone1");
                AliasedValue rpTelephone2 = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.address1_telephone2");
                AliasedValue rpJobTitle = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.jobtitle");
                AliasedValue rpUserType = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.desnz_usertype");
                AliasedValue rpConsultant = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.desnz_consultant");


                // Fetch Assessor (TA1) information
                AliasedValue ta1ID = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.contactid");
                AliasedValue ta1FirstName = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.firstname");
                AliasedValue ta1LastName = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.lastname");
                AliasedValue ta1UserName = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.desnz_username");
                AliasedValue ta1Email = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.emailaddress1");
                AliasedValue ta1Telephone1 = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.address1_telephone1");
                AliasedValue ta1Telephone2 = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.address1_telephone2");
                AliasedValue ta1JobTitle = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.jobtitle");
                AliasedValue ta1UserType = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.desnz_usertype");
                AliasedValue ta1Consultant = results.Entities[0].GetAttributeValue<AliasedValue>("Assessor.desnz_consultant");

                // Determine which contact information to use based on the data.Choice value
                if (certifyChoice == true) // RP Scenario
                {
                    personToReturn.id = new Guid(rpID.Value.ToString());
                    personToReturn.firstName = rpFirstName?.Value.ToString();
                    personToReturn.lastName = rpLastName?.Value.ToString();
                    personToReturn.username = rpUserName?.Value.ToString();
                    personToReturn.email = rpEmail?.Value.ToString();
                    personToReturn.telephone1 = rpTelephone1?.Value.ToString();
                    personToReturn.telephone2 = rpTelephone2?.Value.ToString();
                    personToReturn.jobTitle = rpJobTitle?.Value.ToString();
                    personToReturn.consultant = (bool)rpConsultant.Value;
                    personToReturn.userType = ((OptionSetValue)rpUserType?.Value).Value;
                }
                else // TA1 Scenario
                {
                    personToReturn.id = new Guid(ta1ID.Value.ToString());
                    personToReturn.firstName = ta1FirstName?.Value.ToString();
                    personToReturn.lastName = ta1LastName?.Value.ToString();
                    personToReturn.username = ta1UserName?.Value.ToString();
                    personToReturn.email = ta1Email?.Value.ToString();
                    personToReturn.telephone1 = ta1Telephone1?.Value.ToString();
                    personToReturn.telephone2 = ta1Telephone2?.Value.ToString();
                    personToReturn.jobTitle = ta1JobTitle?.Value.ToString();
                    personToReturn.consultant = (bool)ta1Consultant.Value;
                    personToReturn.userType = ((OptionSetValue)ta1UserType?.Value).Value;

                }
            }

            // Return the fullname, emailAddress, schemeName, and schemeReference
            return (personToReturn, schemeName, schemeReference);
        }

        //Scheme and TA2 info
        public static async Task<(string fullname, string emailAddress, string schemeName, string schemeReference)> GetSchemeAndTA2InfoAsync(
    ServiceClient serviceClient, Guid submissionId)
        {
            if (submissionId == null)
            {
                throw new ArgumentException("Submission ID cannot be null.");
            }

            // Define the query
            QueryExpression query = new QueryExpression
            {
                EntityName = "desnz_submission",
                ColumnSet = new ColumnSet(true),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                         new ConditionExpression("desnz_submissionid", ConditionOperator.Equal, submissionId)
                    }
                },
                LinkEntities =
                    {
                    new LinkEntity
                    {
                        JoinOperator = JoinOperator.Inner,
                        LinkFromEntityName = "desnz_submission",
                        LinkFromAttributeName = "desnz_scheme",
                        LinkToEntityName = "desnz_scheme",
                        LinkToAttributeName = "desnz_schemeid",
                        Columns = new ColumnSet("desnz_schemeid", "desnz_name", "desnz_reference"),
                        EntityAlias = "Scheme",
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner,
                                LinkFromEntityName = "desnz_scheme",
                                LinkFromAttributeName = "desnz_secondassessor",
                                LinkToEntityName = "contact",
                                LinkToAttributeName = "contactid",
                                Columns = new ColumnSet("contactid", "emailaddress1", "firstname", "lastname"),
                                EntityAlias = "SecondAssessor",
                                LinkCriteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                                    }
                                }
                            }
                        }
                    }
                }
            };

            // Retrieve the results
            EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

            // Initialize variables
            string fullname = "";
            string emailAddress = "";
            string schemeName = "";
            string schemeReference = "";

            if (results.Entities.Count > 0)
            {
                // Fetch scheme information
                AliasedValue schemeNameValue = results.Entities[0].GetAttributeValue<AliasedValue>("Scheme.desnz_name");
                AliasedValue schemeReferenceValue = results.Entities[0].GetAttributeValue<AliasedValue>("Scheme.desnz_reference");

                if (schemeNameValue != null) schemeName = schemeNameValue.Value.ToString();
                if (schemeReferenceValue != null) schemeReference = schemeReferenceValue.Value.ToString();

                // Fetch SecondAssessor (TA2) information
                AliasedValue ta2FirstName = results.Entities[0].GetAttributeValue<AliasedValue>("SecondAssessor.firstname");
                AliasedValue ta2LastName = results.Entities[0].GetAttributeValue<AliasedValue>("SecondAssessor.lastname");
                AliasedValue ta2Email = results.Entities[0].GetAttributeValue<AliasedValue>("SecondAssessor.emailaddress1");

                fullname = $"{ta2FirstName?.Value} {ta2LastName?.Value}";
                emailAddress = ta2Email?.Value.ToString();

            }

            // Return the fullname, emailAddress, schemeName, and schemeReference
            return (fullname, emailAddress, schemeName, schemeReference);
        }

        //Scheme and RP info
        public static async Task<(string fullname, string emailAddress, string schemeName, string schemeReference)> GetSchemeAndRPInfoAsync(
    ServiceClient serviceClient, Guid submissionId)
        {
            if (submissionId == null)
            {
                throw new ArgumentException("Submission ID cannot be null.");
            }

            // Define the query
            QueryExpression query = new QueryExpression
            {
                EntityName = "desnz_submission",
                ColumnSet = new ColumnSet(true),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                         new ConditionExpression("desnz_submissionid", ConditionOperator.Equal, submissionId)
                    }
                },
                LinkEntities =
                    {
                    new LinkEntity
                    {
                        JoinOperator = JoinOperator.Inner,
                        LinkFromEntityName = "desnz_submission",
                        LinkFromAttributeName = "desnz_scheme",
                        LinkToEntityName = "desnz_scheme",
                        LinkToAttributeName = "desnz_schemeid",
                        Columns = new ColumnSet("desnz_schemeid", "desnz_name", "desnz_reference"),
                        EntityAlias = "Scheme",
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner,
                                LinkFromEntityName = "desnz_scheme",
                                LinkFromAttributeName = "desnz_responsibleperson",
                                LinkToEntityName = "contact",
                                LinkToAttributeName = "contactid",
                                Columns = new ColumnSet("contactid", "emailaddress1", "firstname", "lastname"),
                                EntityAlias = "ResponsiblePerson",
                                LinkCriteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                                    }
                                }
                            }
                        }
                    }
                }
            };

            // Retrieve the results
            EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

            // Initialize variables
            string fullname = "";
            string emailAddress = "";
            string schemeName = "";
            string schemeReference = "";

            if (results.Entities.Count > 0)
            {
                // Fetch scheme information
                AliasedValue schemeNameValue = results.Entities[0].GetAttributeValue<AliasedValue>("Scheme.desnz_name");
                AliasedValue schemeReferenceValue = results.Entities[0].GetAttributeValue<AliasedValue>("Scheme.desnz_reference");

                if (schemeNameValue != null) schemeName = schemeNameValue.Value.ToString();
                if (schemeReferenceValue != null) schemeReference = schemeReferenceValue.Value.ToString();

                // Fetch SecondAssessor (TA2) information
                AliasedValue rpFirstName = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.firstname");
                AliasedValue rpLastName = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.lastname");
                AliasedValue rpEmail = results.Entities[0].GetAttributeValue<AliasedValue>("ResponsiblePerson.emailaddress1");

                fullname = $"{rpFirstName?.Value} {rpLastName?.Value}";
                emailAddress = rpEmail?.Value.ToString();
            }

            // Return the fullname, emailAddress, schemeName, and schemeReference
            return (fullname, emailAddress, schemeName, schemeReference);
        }

        //Current User
        public static async Task<(Person user, string userFullName, string errorMessage)> GetCurrentUserFullNameAsync(ServiceClient serviceClient, ClaimsPrincipal User)
        {
            // Get Current User's Email
            var email = User.Claims.FirstOrDefault(x => x.Type == "preferred_username")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return (null, string.Empty, "Email not found in user claims.");
            }

            // Query to Get User by Email
            QueryExpression userQuery = new QueryExpression
            {
                EntityName = "contact",
                ColumnSet = new ColumnSet("firstname", "lastname", "contactid"),
                Criteria = new FilterExpression
                {
                    Conditions =
            {
                new ConditionExpression("emailaddress1", ConditionOperator.Equal, email)
            }
                }
            };

            EntityCollection userResults = await serviceClient.RetrieveMultipleAsync(userQuery);

            if (userResults.Entities.Count > 0)
            {
                // Create and return user object with full name
                Person user = new Person
                {
                    id = userResults.Entities[0].GetAttributeValue<Guid>("contactid"),
                    firstName = userResults.Entities[0].GetAttributeValue<string>("firstname"),
                    lastName = userResults.Entities[0].GetAttributeValue<string>("lastname")
                };

                string userFullName = $"{user.firstName} {user.lastName}";
                return (user, userFullName, string.Empty); // No error message, user found
            }
            else
            {
                return (null, string.Empty, "User not found.");
            }

        }


        /// <summary>
        /// Returns a Person with all the user info
        /// </summary>
        /// <param name="serviceClient"></param>
        /// <param name="User"></param>
        /// <returns></returns>
        public static async Task<Person> GetUserPersonInfoAsync(ServiceClient serviceClient, ClaimsPrincipal User)
        {
            // Get Current User's Email
            var email = User.Claims.FirstOrDefault(x => x.Type == "preferred_username")?.Value;

            Person user = new Person();



            if (string.IsNullOrEmpty(email))
            {
                return user;
            }

            // Query to Get User by Email
            QueryExpression userQuery = new QueryExpression
            {
                EntityName = "contact",
                ColumnSet = new ColumnSet("contactid", "firstname", "lastname", "emailaddress1", "jobtitle", "desnz_usertype", "desnz_consultant", "address1_telephone1", "address1_telephone2"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("emailaddress1", ConditionOperator.Equal, email)
                    }
                }
            };

            EntityCollection userResults = await serviceClient.RetrieveMultipleAsync(userQuery);

            if (userResults.Entities.Count > 0)
            {
                user.id = userResults.Entities[0].GetAttributeValue<Guid?>("contactid");
                user.firstName = userResults.Entities[0].GetAttributeValue<string?>("firstname");
                user.lastName = userResults.Entities[0].GetAttributeValue<string?>("lastname");
                user.email = userResults.Entities[0].GetAttributeValue<string?>("emailaddress1");
                user.jobTitle = userResults.Entities[0].GetAttributeValue<string?>("jobtitle");
                if (userResults.Entities[0].Attributes.ContainsKey("desnz_usertype") && userResults.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                {
                    user.userType = optionSetValue.Value;
                }
                user.consultant = userResults.Entities[0].GetAttributeValue<bool?>("desnz_consultant");
                user.telephone1 = userResults.Entities[0].GetAttributeValue<string?>("address1_telephone1");
                user.telephone2 = userResults.Entities[0].GetAttributeValue<string?>("address1_telephone2");
                
            }

            return user;
        }

    }
}
