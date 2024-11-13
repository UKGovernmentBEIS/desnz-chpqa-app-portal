using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Security.Claims;
using WebApi.Model;

namespace WebApi.Services
{
    public static class AuthorizationService
    {

        public static async Task<Guid> GetUserId(ClaimsPrincipal User, ServiceClient service)
        {

            var email = User.Claims.First(x => x.Type == "preferred_username").Value;

            QueryExpression query = new QueryExpression
            {
                EntityName = "contact", // Specify the name of the parent entity
                ColumnSet = new ColumnSet("contactid", "desnz_usertype"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("emailaddress1", ConditionOperator.Equal, email),
                        new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                    }
                }
            };

            EntityCollection results = await service.RetrieveMultipleAsync(query);

            if (results.Entities.Count > 0)
            {
                if (results.Entities[0].Attributes.ContainsKey("contactid"))
                {
                    return results.Entities[0].GetAttributeValue<Guid>("contactid");
                }
            }

            return Guid.Empty;

        }

        public static async Task<bool> ValidateUserRole(ClaimsPrincipal User, ServiceClient service)
        {
            try
            {
                var email = User.Claims.First(x => x.Type == "preferred_username").Value;

                QueryExpression query = new QueryExpression
                {
                    EntityName = "contact", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("contactid", "desnz_usertype"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("emailaddress1", ConditionOperator.Equal, email),
                            new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                        }
                    }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                if (results.Entities.Count > 0)
                {
                    if (results.Entities[0].Attributes.ContainsKey("desnz_usertype") && results.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                    {
                        if (optionSetValue.Value == (int)Person.UserType.ResponsiblePerson) return true;
                    }
                }
                else { return false; }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static async Task<bool> ValidateTAssessorRole(ClaimsPrincipal User, ServiceClient service)
        {
            try
            {
                var email = User.Claims.First(x => x.Type == "preferred_username").Value;

                QueryExpression query = new QueryExpression
                {
                    EntityName = "contact", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("contactid", "desnz_usertype"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("emailaddress1", ConditionOperator.Equal, email),
                            new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                        }
                    }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                if (results.Entities.Count > 0)
                {
                    if (results.Entities[0].Attributes.ContainsKey("desnz_usertype") && results.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                    {
                        if (optionSetValue.Value == (int)Person.UserType.TechnicalAssessor ||
                            optionSetValue.Value == (int)Person.UserType.TechnicalAssessor2 ||
                            optionSetValue.Value == (int)Person.UserType.AssessorAdmin
                            ) return true;
                    }
                }
                else { return false; }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static async Task<bool> ValidateUserData(ClaimsPrincipal User, ServiceClient service, EntityCollection results)
        {
            try
            {
                // TODO should change after UAT

                //if technical assessor 1 return true
                if (await AuthorizationService.ValidateTAssessorRole(User, service)) return true;
                //if not rp return false
                else if (!await AuthorizationService.ValidateUserRole(User, service)) return false;



                var userEmail = User.Claims.First(x => x.Type == "preferred_username").Value;

                bool anyHaveSpecificEmail = results.Entities.Any(a =>
                {

                    var responsiblePersonEmailAttr = a.GetAttributeValue<AliasedValue>("ResponsiblePerson.emailaddress1");
                    var responsiblePersonEmail = responsiblePersonEmailAttr?.Value?.ToString();

                    var optoutRPEmailAttr = a.GetAttributeValue<AliasedValue>("OptoutRP.emailaddress1");
                    var optoutRPEmail = optoutRPEmailAttr?.Value?.ToString();

                    var delegateRPEmailAttr = a.GetAttributeValue<AliasedValue>("DelegateRP.emailaddress1");
                    var delegateRPEmail = delegateRPEmailAttr?.Value?.ToString();

                    var AssessorEmailAttr = a.GetAttributeValue<AliasedValue>("Assessor.emailaddress1");
                    var AssessorEmail = AssessorEmailAttr?.Value?.ToString();

                    var SecondassessorAttr = a.GetAttributeValue<AliasedValue>("Secondassessor.emailaddress1");
                    var SecondAssessor = SecondassessorAttr?.Value?.ToString();

                    return (responsiblePersonEmail != null && string.Equals(responsiblePersonEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (optoutRPEmail != null && string.Equals(optoutRPEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (AssessorEmail != null && string.Equals(AssessorEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (SecondAssessor != null && string.Equals(SecondAssessor, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (delegateRPEmail != null && string.Equals(delegateRPEmail, userEmail, StringComparison.OrdinalIgnoreCase));
                });

                if (anyHaveSpecificEmail) return true;

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static async Task<bool> ValidateUserData(ClaimsPrincipal User, ServiceClient service, Guid Schemeid)
        {
            try
            {

                // TODO should change after UAT

                //if technical assessor 1 return true
                if (await AuthorizationService.ValidateTAssessorRole(User, service)) return true;
                //if not rp return false
                else if (!await AuthorizationService.ValidateUserRole(User, service)) return false;




                QueryExpression query = new QueryExpression
                {
                    EntityName = "desnz_scheme", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("desnz_schemeid"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("desnz_schemeid", ConditionOperator.Equal, Schemeid)
                        }
                    },
                    LinkEntities =
                    {
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.Inner, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_responsibleperson", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid","emailaddress1"),
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
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_optoutrp", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid","emailaddress1"),
                            EntityAlias = "OptoutRP", // Alias for the related entity                              
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_delegaterp", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid","emailaddress1"),
                            EntityAlias = "DelegateRP",
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_assessor", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid","emailaddress1"),
                            EntityAlias = "Assessor",
                        },
                        new LinkEntity
                        {
                            JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                            LinkFromEntityName = "desnz_scheme", // Parent entity
                            LinkFromAttributeName = "desnz_secondassessor", // Parent entity attribute
                            LinkToEntityName = "contact", // Related entity
                            LinkToAttributeName = "contactid", // Related entity attribute
                            Columns =  new ColumnSet("contactid","emailaddress1"),
                            EntityAlias = "Secondassessor",
                        }
                    }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                var userEmail = User.Claims.First(x => x.Type == "preferred_username").Value;

                bool anyHaveSpecificEmail = results.Entities.Any(a =>
                {

                    var responsiblePersonEmailAttr = a.GetAttributeValue<AliasedValue>("ResponsiblePerson.emailaddress1");
                    var responsiblePersonEmail = responsiblePersonEmailAttr?.Value?.ToString();

                    var optoutRPEmailAttr = a.GetAttributeValue<AliasedValue>("OptoutRP.emailaddress1");
                    var optoutRPEmail = optoutRPEmailAttr?.Value?.ToString();

                    var delegateRPEmailAttr = a.GetAttributeValue<AliasedValue>("DelegateRP.emailaddress1");
                    var delegateRPEmail = delegateRPEmailAttr?.Value?.ToString();

                    var AssessorEmailAttr = a.GetAttributeValue<AliasedValue>("Assessor.emailaddress1");
                    var AssessorEmail = AssessorEmailAttr?.Value?.ToString();

                    var SecondassessorAttr = a.GetAttributeValue<AliasedValue>("Secondassessor.emailaddress1");
                    var SecondAssessor = SecondassessorAttr?.Value?.ToString();

                    return (responsiblePersonEmail != null && string.Equals(responsiblePersonEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (optoutRPEmail != null && string.Equals(optoutRPEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (AssessorEmail != null && string.Equals(AssessorEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (SecondAssessor != null && string.Equals(SecondAssessor, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (delegateRPEmail != null && string.Equals(delegateRPEmail, userEmail, StringComparison.OrdinalIgnoreCase));
                });

                if (anyHaveSpecificEmail) return true;

                return false;

            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static async Task<bool> ValidateUserDataSubid(ClaimsPrincipal User, ServiceClient service, Guid Submissionid)
        {
            try
            {

                // TODO should change after UAT

                //if technical assessor 1 return true
                if (await AuthorizationService.ValidateTAssessorRole(User, service)) return true;
                //if not rp return false
                else if (!await AuthorizationService.ValidateUserRole(User, service)) return false;



                QueryExpression query = new QueryExpression
                {
                    EntityName = "desnz_submission", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet(true),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                            {
                    new ConditionExpression("desnz_submissionid", ConditionOperator.Equal, Submissionid)
                            }
                    },
                    LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_submission", // Parent entity
                                LinkFromAttributeName = "desnz_scheme", // Parent entity attribute
                                LinkToEntityName = "desnz_scheme", // Related entity
                                LinkToAttributeName = "desnz_schemeid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_schemeid","desnz_name"),
                                EntityAlias = "Scheme", // Alias for the related entity
                                LinkEntities =
                                {
                                   new LinkEntity
                                   {
                                    JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                    LinkFromEntityName = "desnz_scheme", // Parent entity
                                    LinkFromAttributeName = "desnz_responsibleperson", // Parent entity attribute
                                    LinkToEntityName = "contact", // Related entity
                                    LinkToAttributeName = "contactid", // Related entity attribute
                                    Columns =  new ColumnSet("contactid","emailaddress1"),
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
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_optoutrp", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "OptoutRP", // Alias for the related entity                              
                                    },
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_delegaterp", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "DelegateRP",
                                    },
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_assessor", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "Assessor",
                                    },
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_secondassessor", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "Secondassessor",
                                    }
                                }
                             }
                         }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                var userEmail = User.Claims.First(x => x.Type == "preferred_username").Value;

                bool anyHaveSpecificEmail = results.Entities.Any(a =>
                {

                    var responsiblePersonEmailAttr = a.GetAttributeValue<AliasedValue>("ResponsiblePerson.emailaddress1");
                    var responsiblePersonEmail = responsiblePersonEmailAttr?.Value?.ToString();

                    var optoutRPEmailAttr = a.GetAttributeValue<AliasedValue>("OptoutRP.emailaddress1");
                    var optoutRPEmail = optoutRPEmailAttr?.Value?.ToString();

                    var delegateRPEmailAttr = a.GetAttributeValue<AliasedValue>("DelegateRP.emailaddress1");
                    var delegateRPEmail = delegateRPEmailAttr?.Value?.ToString();

                    var AssessorEmailAttr = a.GetAttributeValue<AliasedValue>("Assessor.emailaddress1");
                    var AssessorEmail = AssessorEmailAttr?.Value?.ToString();

                    var SecondassessorAttr = a.GetAttributeValue<AliasedValue>("Secondassessor.emailaddress1");
                    var SecondAssessor = SecondassessorAttr?.Value?.ToString();


                    return (responsiblePersonEmail != null && string.Equals(responsiblePersonEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (optoutRPEmail != null && string.Equals(optoutRPEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (AssessorEmail != null && string.Equals(AssessorEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (SecondAssessor != null && string.Equals(SecondAssessor, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (delegateRPEmail != null && string.Equals(delegateRPEmail, userEmail, StringComparison.OrdinalIgnoreCase));
                });

                if (anyHaveSpecificEmail) return true;

                return false;

            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public static async Task<bool> ValidateUserDataSubid(string UserClaim, ServiceClient service, Guid Submissionid)
        {
            try
            {
                // TODO should change after UAT
                //if technical assessor 1 or technical assessor 2 return true
                if (await AuthorizationService.ValidateTAssessorRole(UserClaim, service)) return true;
                
                QueryExpression query = new QueryExpression
                {
                    EntityName = "desnz_submission", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet(true),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                            {
                    new ConditionExpression("desnz_submissionid", ConditionOperator.Equal, Submissionid)
                            }
                    },
                    LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                LinkFromEntityName = "desnz_submission", // Parent entity
                                LinkFromAttributeName = "desnz_scheme", // Parent entity attribute
                                LinkToEntityName = "desnz_scheme", // Related entity
                                LinkToAttributeName = "desnz_schemeid", // Related entity attribute
                                Columns =  new ColumnSet("desnz_schemeid","desnz_name"),
                                EntityAlias = "Scheme", // Alias for the related entity
                                LinkEntities =
                                {
                                   new LinkEntity
                                   {
                                    JoinOperator = JoinOperator.Inner, // Inner join for related entity
                                    LinkFromEntityName = "desnz_scheme", // Parent entity
                                    LinkFromAttributeName = "desnz_responsibleperson", // Parent entity attribute
                                    LinkToEntityName = "contact", // Related entity
                                    LinkToAttributeName = "contactid", // Related entity attribute
                                    Columns =  new ColumnSet("contactid","emailaddress1"),
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
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_optoutrp", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "OptoutRP", // Alias for the related entity                              
                                    },
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_delegaterp", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "DelegateRP",
                                    },
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_assessor", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "Assessor",
                                    },
                                    new LinkEntity
                                    {
                                        JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                        LinkFromEntityName = "desnz_scheme", // Parent entity
                                        LinkFromAttributeName = "desnz_secondassessor", // Parent entity attribute
                                        LinkToEntityName = "contact", // Related entity
                                        LinkToAttributeName = "contactid", // Related entity attribute
                                        Columns =  new ColumnSet("contactid","emailaddress1"),
                                        EntityAlias = "Secondassessor",
                                    }
                                }
                             }
                         }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                var userEmail = UserClaim;

                bool anyHaveSpecificEmail = results.Entities.Any(a =>
                {

                    var responsiblePersonEmailAttr = a.GetAttributeValue<AliasedValue>("ResponsiblePerson.emailaddress1");
                    var responsiblePersonEmail = responsiblePersonEmailAttr?.Value?.ToString();

                    var optoutRPEmailAttr = a.GetAttributeValue<AliasedValue>("OptoutRP.emailaddress1");
                    var optoutRPEmail = optoutRPEmailAttr?.Value?.ToString();

                    var delegateRPEmailAttr = a.GetAttributeValue<AliasedValue>("DelegateRP.emailaddress1");
                    var delegateRPEmail = delegateRPEmailAttr?.Value?.ToString();

                    var AssessorEmailAttr = a.GetAttributeValue<AliasedValue>("Assessor.emailaddress1");
                    var AssessorEmail = AssessorEmailAttr?.Value?.ToString();

                    var SecondassessorAttr = a.GetAttributeValue<AliasedValue>("Secondassessor.emailaddress1");
                    var SecondAssessor = SecondassessorAttr?.Value?.ToString();


                    return (responsiblePersonEmail != null && string.Equals(responsiblePersonEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (optoutRPEmail != null && string.Equals(optoutRPEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (AssessorEmail != null && string.Equals(AssessorEmail, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (SecondAssessor != null && string.Equals(SecondAssessor, userEmail, StringComparison.OrdinalIgnoreCase)) ||
                           (delegateRPEmail != null && string.Equals(delegateRPEmail, userEmail, StringComparison.OrdinalIgnoreCase));
                });

                if (anyHaveSpecificEmail) return true;

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static async Task<bool> ValidateUserRole(string UserClaim, ServiceClient service)
        {
            try
            {
                var email = UserClaim;

                QueryExpression query = new QueryExpression
                {
                    EntityName = "contact", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("contactid", "desnz_usertype"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("emailaddress1", ConditionOperator.Equal, email),
                            new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                        }
                    }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                if (results.Entities.Count > 0)
                {
                    if (results.Entities[0].Attributes.ContainsKey("desnz_usertype") && results.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                    {
                        if (optionSetValue.Value == (int)Person.UserType.ResponsiblePerson) return true;
                    }
                }
                else { return false; }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static async Task<bool> ValidateTAssessorRole(string UserClaim, ServiceClient service)
        {
            try
            {
                var email = UserClaim;

                QueryExpression query = new QueryExpression
                {
                    EntityName = "contact", // Specify the name of the parent entity
                    ColumnSet = new ColumnSet("contactid", "desnz_usertype"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("emailaddress1", ConditionOperator.Equal, email),
                            new ConditionExpression("statecode", ConditionOperator.Equal, 0)
                        }
                    }
                };

                EntityCollection results = await service.RetrieveMultipleAsync(query);

                if (results.Entities.Count > 0)
                {
                    if (results.Entities[0].Attributes.ContainsKey("desnz_usertype") && results.Entities[0]["desnz_usertype"] is OptionSetValue optionSetValue)
                    {
                        if (optionSetValue.Value == (int)Person.UserType.TechnicalAssessor || 
                            optionSetValue.Value == (int)Person.UserType.TechnicalAssessor2 ||
                            optionSetValue.Value == (int)Person.UserType.AssessorAdmin
                            ) return true;
                    }
                }
                else { return false; }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
