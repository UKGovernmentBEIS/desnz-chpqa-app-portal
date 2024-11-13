using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk;
using System.Security.Claims;
using Microsoft.PowerPlatform.Dataverse.Client;
using WebApi.Contracts;
using WebApi.Services;
using WebApi.Model;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using WebApi.Controllers;
//using System.Linq;

namespace WebApi.Functions
{
    /// <summary>
    /// An Interface to Responsible Persons Data Stack so as to provide a way to use a different implementation in the future
    /// </summary>
    public interface IRPDataStack
    {
        public Task<List<Person>> CollectRPData();

    }

    /// <summary>
    /// The class (current implementation) to collect all the Responsible Persons Data who have active schemes, because 
    /// many of these data are going to be used to assemble and send the emails 2 weeks before due date.
    /// The main idea here is to provide a List of Person objects so as to 
    /// pop each element after the email for this person is generated and send.
    /// Initially significant effort was spend in order to supply an Iterator or AsyncIterator but unfortunately we
    /// cannot yield return inside a try catch block.
    /// </summary>
    public class GetResponsiblePersonStack: IRPDataStack
    {
        private List<Person> _assessorsList;
        private readonly IServiceClientFactory _serviceClientFactory;
        private readonly ILogger _logger;
        public GetResponsiblePersonStack(ILogger logger,IServiceClientFactory serviceClientFactory)
        {
            _assessorsList = new List<Person>();
            _serviceClientFactory = serviceClientFactory;
            _logger = logger;
        }
        /// <summary>
        /// A method for collecting all the Responsible Persons Data who have active schemes.
        /// this is where the most work is done
        /// </summary>
        /// <returns></returns>
        public async Task<List<Person>> CollectRPData(){
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    //ReplyPerson person = new ReplyPerson();
                    
                    ///<summary>
                    ///Since contact entities are related to scheme entities via a lookup entityref field desnz_responsibleperson from 
                    ///scheme to person (which means that in each scheme there is a reference to a contact record)
                    ///we cannot use Join operation between the two entities (because we want all the persons who have acive scheme)
                    ///We are going the opposite way collecting from all the active schemes the responsible person in order to use it
                    ///in a subsequent query as a criteria with In operation
                    ///</summary>
                    QueryExpression CollectActiveSchemes_q = new QueryExpression
                    {
                        EntityName = "desnz_scheme", 
                        ColumnSet = new ColumnSet("desnz_responsibleperson"),
                        //ColumnSet = new ColumnSet() { AllColumns = true },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_status", ConditionOperator.In, new int[] { 0,1,2,3,4 }) //Person.UserType.ResponsiblePerson)    
                                //new ConditionExpression("desnz_latestsubmissionstatus", ConditionOperator.Equal, 0)
                            }
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection CollectActiveSchemes_r = await serviceClient.RetrieveMultipleAsync(CollectActiveSchemes_q);
                    ///<summary>
                    /// in this Query we need to collect all the contacts that are RPs, Active and have Active Scheme(s)
                    /// this is why we use in the third contition a functional map collecting all active scheme ids from previous query.
                    /// It works exceptionaly well.
                    ///</summary>
                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "contact", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("contactid", "firstname", "lastname", "emailaddress1", "desnz_usertype",
                                                "jobtitle", "desnz_consultant", "address1_telephone1", "address1_telephone2"),
                        //ColumnSet = new ColumnSet() { AllColumns = true },
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_usertype", ConditionOperator.Equal, 1), //Person.UserType.ResponsiblePerson)    
                                new ConditionExpression("statecode", ConditionOperator.Equal, 0),
                                new ConditionExpression("contactid", ConditionOperator.In,
                                    CollectActiveSchemes_r.Entities.Select(x => x.GetAttributeValue<EntityReference>("desnz_responsibleperson")?.Id ?? Guid.Empty).Distinct().ToArray()
                                    )
                            }
                        }
                    };

                    // Execute RetrieveMultiple request
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    if (results.Entities.Count > 0)
                    {
                        // Traverse each element of the EntityCollection in a functional style with LINQ
                        // and push a new Person object for each Entity initializing it with the Entity's data

                        _assessorsList= results.Entities.Select(x =>
                           new Person
                            {
                                id = x.GetAttributeValue<Guid>("contactid"),
                                firstName = x.GetAttributeValue<string>("firstname"),
                                lastName = x.GetAttributeValue<string>("lastname"),
                                email = x.GetAttributeValue<string>("emailaddress1"),
                                userType = (int)Person.UserType.ResponsiblePerson,
                                jobTitle = x.GetAttributeValue<string>("jobtitle"),
                                consultant = x.GetAttributeValue<bool?>("desnz_consultant"),
                                telephone1 = x.GetAttributeValue<string>("address1_telephone1"),
                                telephone2 = x.GetAttributeValue<string>("address1_telephone2")
                            }                                
                        ).ToList();
                        
                    }                    
                }

                return _assessorsList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun("In Collecting RPs Data Stack", ex);

                return new List<Person>();
            }
        }

    }
}
