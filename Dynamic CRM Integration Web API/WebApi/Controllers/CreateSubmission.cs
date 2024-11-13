using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using System.Xml.Linq;
using WebApi.Contracts;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class CreateSubmission : ControllerBase
    {
        private readonly ILogger<CreateSubmission> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public CreateSubmission(ILogger<CreateSubmission> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Creates a Submission entity ( F2, F2s ) with the basic fields.
        /// ( In the future we will add F4, F4s fields in this entity and maybe for F3, not sure yet! )
        ///
        ///
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <param name="data"></param>
        /// <returns>New Submission Id</returns>
        /// <response code="200">Returns the id of the new Submission</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [HttpPost("CreateSubmission")]
        [SwaggerOperation(Summary = "Create Submission", Description = "CreateSubmission with the given data.")]
        [ProducesResponseType(typeof(RequestReturnId), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]

        public async Task<ActionResult<RequestReturnId>> PostSubmission(RequestSubmission data)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {

                    //
                    if (!await AuthorizationService.ValidateUserData(User, serviceClient, (Guid)data.scheme?.id)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //

                    RequestReturnId returnId = new RequestReturnId();

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_scheme", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet("desnz_name", "desnz_policychpqa", "desnz_policyrocs"),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                            {
                                new ConditionExpression("desnz_schemeid", ConditionOperator.Equal, (Guid)data.scheme?.id)
                            }
                        },
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_scheme", // Parent entity
                                LinkFromAttributeName = "desnz_policyrocs", // Parent entity attribute
                                LinkToEntityName = "desnz_schemepolicy", // Related entity
                                LinkToAttributeName = "desnz_schemepolicyid", // Related entity attribute
                                Columns = new ColumnSet("desnz_schemepolicyid", "desnz_name", "desnz_type", "desnz_latest"),
                                EntityAlias = "PolicyRocsCfd",
                            }
                        }
                    };

                    // Execute the QueryExpression to retrieve multiple records
                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);



                    // START SUBMISSION /////////////////

                    Entity submission = new("desnz_submission");
                    submission["desnz_name"] = data.name;
                    submission["desnz_submissionformtype"] = new OptionSetValue(data.submissionFormType ?? (int)Submission.SubmissionFormType.F2);
                    submission["desnz_year"] = data.year;
                    submission["desnz_version"] = data.version;
                    submission["desnz_status"] = new OptionSetValue((int)Submission.SubmissionStatus.NotStarted);


                    //give id of scheme
                    submission["desnz_scheme"] = new EntityReference("desnz_scheme", data.scheme?.id ?? Guid.Empty);


                    EntityReference policyCHPQAEntityRef = null;
                    EntityReference policyROCSCFDEntityRef = null;
                    Policy policyROCSCFD = null;

                    if (results.Entities.Count > 0)
                    {
                        // policy CHPQA
                        if (results.Entities[0].Attributes.Contains("desnz_policychpqa") && results.Entities[0]["desnz_policychpqa"] != null)
                        {
                            policyCHPQAEntityRef = results.Entities[0]["desnz_policychpqa"] as EntityReference;
                        }

                        string policyCHPQAName = policyCHPQAEntityRef?.Name ?? string.Empty;
                        Guid policyCHPQAId = policyCHPQAEntityRef == null ? Guid.Empty : policyCHPQAEntityRef.Id;

                        Policy policyCHPQA = new Policy();
                        policyCHPQA.id = policyCHPQAId;
                        policyCHPQA.name = policyCHPQAName;

                        // new reference
                        submission["desnz_policychpqa"] = new EntityReference("desnz_schemepolicy", policyCHPQA.id ?? Guid.Empty);


                        // policy ROCS / CFD
                        AliasedValue policyRocsCfdId = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyRocsCfd.desnz_schemepolicyid"))
                        {
                            policyRocsCfdId = (AliasedValue)results.Entities[0]["PolicyRocsCfd.desnz_schemepolicyid"];
                        }
                        AliasedValue policyRocsCfdName = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyRocsCfd.desnz_name"))
                        {
                            policyRocsCfdName = (AliasedValue)results.Entities[0]["PolicyRocsCfd.desnz_name"];
                        }

                        AliasedValue policyRocsCfdType = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyRocsCfd.desnz_type"))
                        {
                            policyRocsCfdType = (AliasedValue)results.Entities[0]["PolicyRocsCfd.desnz_type"];
                        }

                        AliasedValue policyRocsCfdLatest = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyRocsCfd.desnz_latest"))
                        {
                            policyRocsCfdLatest = (AliasedValue)results.Entities[0]["PolicyRocsCfd.desnz_latest"];
                        }

                        // policy ROCS / CFD
                        policyROCSCFD = new Policy();
                        policyROCSCFD.id = policyRocsCfdId == null ? Guid.Empty : (Guid)policyRocsCfdId.Value;
                        policyROCSCFD.name = policyRocsCfdName?.Value.ToString() ?? string.Empty;
                        policyROCSCFD.type = null;
                        if (policyRocsCfdType?.Value is OptionSetValue optionSetValue)
                        {
                            policyROCSCFD.type = optionSetValue.Value;
                        }
                        policyROCSCFD.latest = policyRocsCfdLatest == null ? null : (bool)policyRocsCfdLatest.Value;

                        // new reference
                        submission["desnz_policyrocscfd"] = new EntityReference("desnz_schemepolicy", policyROCSCFD.id ?? Guid.Empty);

                    }



                    submission["desnz_schemeapplyingforcertificationisexisting"] = data.schemeApplyingForCertificationIsExisting;
                    submission["desnz_chpfuelbillingperiod"] = new OptionSetValue(data.chpFuelBillingPeriod ?? (int)Submission.FuelBillingPeriodType.Quarterly);
                    submission["desnz_chpfuelbillingperiodother"] = data.chpFuelBillingPeriodOther;

                    /*submission["desnz_schemelinediagramexists"] = data.schemeLineDiagramExists;
                    submission["desnz_schemeenergyflowdiagramexists"] = data.schemeEnergyFlowDiagramExists;
                    submission["desnz_annualheatprofileexists"] = data.annualHeatProfileExists;
                    submission["desnz_dailyheatprofileexists"] = data.dailyHeatProfileExists;
                    submission["desnz_heatloaddurationcurveexists"] = data.heatLoadDurationCurveExists;*/

                    submission["desnz_didyourschemeachievethepowerefficiencythres"] = null;

                    // set power efficiency threshold to 20
                    submission["desnz_thepowerefficiencythresholdforyourschemeis"] = 20.0m;

                    //heat rejection facility
                    submission["desnz_heatrejectionfacility"] = null;

                    // certificates
                    submission["desnz_needasoscertificate"] = null;
                    submission["desnz_needanrenewablesobligationcertificate"] = null;
                    submission["desnz_needacontractsfordifferencecertificate"] = null;

                    // QI threshold, we have an api call to set it
                    submission["desnz_didyourschemeachievetheqithreshold"] = null;

                    // ROCS/CFD QI threshold achieved
                    submission["desnz_rocscfdqithresholdachieved"] = null;

                    // zratio
                    submission["desnz_isthezratioofthisschemedetermined"] = null;






                    //TODO



                    // create submission
                    submission.Id = await serviceClient.CreateAsync(submission);

                    returnId.id = submission.Id;

                    SubmissionGroupDiction subGroupDict = new SubmissionGroupDiction();
                    Dictionary<int, Dictionary<int, DictionaryNames>> dictSimple = new Dictionary<int, Dictionary<int, DictionaryNames>>();
                    
                    dictSimple.Add((int)SubmissionGroups.GroupCategory.AssessorComments, subGroupDict.groupDictAssessorComments);
                    dictSimple.Add((int)SubmissionGroups.GroupCategory.AssignSchemeAndSetPolicy, subGroupDict.groupDictAssignSchemeAndSetPolicy);

                    // if complex
                    if (data.submissionFormType == (int)Submission.SubmissionFormType.F2 || data.submissionFormType == (int)Submission.SubmissionFormType.F4)   // if complex
                    {

                        dictSimple.Add((int)SubmissionGroups.GroupCategory.SchemeDetails, subGroupDict.groupDictSchemeDetails);
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.SchemeCapacityDetails, subGroupDict.groupDictSchemeCapDetails);
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, subGroupDict.groupDictSchemePerfDetails);

                        if (policyROCSCFD != null && policyROCSCFD.type == (int)Policy.PolicyTypes.ROCs)
                        {
                            dictSimple.Add((int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, subGroupDict.groupDictRocCertifAndBenefitsDetails);
                            dictSimple.Add((int)SubmissionGroups.GroupCategory.ThresholdDetails, subGroupDict.groupDictRocThresholdDetails);
                        }
                        else
                        {
                            dictSimple.Add((int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, subGroupDict.groupDictCfdCertifAndBenefitsDetails);
                            dictSimple.Add((int)SubmissionGroups.GroupCategory.ThresholdDetails, subGroupDict.groupDictCfdThresholdDetails);
                        }
                    }
                    else if (data.submissionFormType == (int)Submission.SubmissionFormType.F2s || data.submissionFormType == (int)Submission.SubmissionFormType.F4s)   // if simple
                    {
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.SchemeDetails, subGroupDict.groupDictSchemeDetailsSimple);
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.SchemeCapacityDetails, subGroupDict.groupDictSchemeCapDetailsSimple);
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.SchemePerformanceDetails, subGroupDict.groupDictSchemePerfDetailsSimple);
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.CertificatesAndBenefitsDetails, subGroupDict.groupDictCertifAndBenefitsDetailsSimple);
                        dictSimple.Add((int)SubmissionGroups.GroupCategory.ThresholdDetails, subGroupDict.groupDictThresholdDetailsSimple);
                    }
                    // Add to dictionary the generic groups
                    dictSimple.Add((int)SubmissionGroups.GroupCategory.SubmitToAssessor, subGroupDict.groupDictSubmitToAssessor);   // RP
                    dictSimple.Add((int)SubmissionGroups.GroupCategory.ReturnToAssessor, subGroupDict.groupDictReturnToAssessor);   // RP
                    dictSimple.Add((int)SubmissionGroups.GroupCategory.CompleteAssessment, subGroupDict.groupDictCompleteAssessment); // TA1 TA2



                    int countOrder = 0;
                    bool isGroupTypeWithNoStatus = false;
                    foreach (var dict in dictSimple)
                    {
                        foreach (var item in dict.Value)
                        {
                            isGroupTypeWithNoStatus = false;
                            countOrder++;

                            Entity submissionGroup = new("desnz_group");

                            submissionGroup["desnz_name"] = item.Value.name;
                            submissionGroup["desnz_submittedname"] = item.Value.submittedName;

                            submissionGroup["desnz_userrole"] = new OptionSetValue(item.Value.userRole ?? (int)SubmissionGroups.GroupUserRole.All);


                            submissionGroup["desnz_groupcategory"] = new OptionSetValue(dict.Key);
                            submissionGroup["desnz_grouptype"] = new OptionSetValue(item.Key);

                            submissionGroup["desnz_displayorder"] = countOrder;


                            //set the starting status
                            foreach (int i in Enum.GetValues(typeof(SubmissionGroups.GroupTypeWithNoStatus)))
                            {
                                if ((int)item.Key == (int)i)
                                {
                                    //Console.WriteLine(" " + (int)item.Key + " " + (int)i);
                                    isGroupTypeWithNoStatus = true;
                                }
                            }
                            if (!isGroupTypeWithNoStatus)
                            {
                                if (dict.Key == (int)SubmissionGroups.GroupCategory.SchemeDetails || dict.Key == (int)SubmissionGroups.GroupCategory.SchemeCapacityDetails) // ALL
                                {
                                    submissionGroup["desnz_status"] = new OptionSetValue((int)SubmissionGroups.StatusType.NotStarted);
                                    submissionGroup["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NotStarted);
                                }
                                else if (dict.Key == (int)SubmissionGroups.GroupCategory.CompleteAssessment) // TA1 - TA2
                                {
                                    submissionGroup["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.CannotStartYet);
                                }
                                else if (dict.Key == (int)SubmissionGroups.GroupCategory.AssessorComments) // RP - TA2
                                {
                                    if(item.Value.userRole == (int)SubmissionGroups.GroupUserRole.RP)
                                    {
                                        submissionGroup["desnz_status"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NotStarted);
                                    }
                                    else if(item.Value.userRole == (int)SubmissionGroups.GroupUserRole.TA2) 
                                    {
                                        submissionGroup["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NotStarted);
                                    }

                                }
                                else    // ALL
                                {
                                    //(int)SubmissionGroups.GroupCategory.SubmitToAssessor || (int)SubmissionGroups.GroupCategory.ReturnToAssessor
                                    if (item.Value.userRole == (int)SubmissionGroups.GroupUserRole.RP) 
                                    {
                                        submissionGroup["desnz_status"] = new OptionSetValue((int)SubmissionGroups.StatusType.CannotStartYet);
                                    }
                                    else
                                    {
                                        submissionGroup["desnz_status"] = new OptionSetValue((int)SubmissionGroups.StatusType.CannotStartYet);

                                        submissionGroup["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NotStarted);
                                    }
                                    if (Enum.IsDefined(typeof(SubmissionGroups.GroupTypeWithNotApplicapleStatus), (int)item.Key))
                                    {
                                        submissionGroup["desnz_status"] = new OptionSetValue((int)SubmissionGroups.StatusType.NotApplicable);
                                        submissionGroup["desnz_assessorstatus"] = new OptionSetValue((int)SubmissionGroups.AssessorStatus.NotApplicable);
                                    }
                                }
                            }
                            else
                            {
                                submissionGroup["desnz_status"] = null;
                                submissionGroup["desnz_assessorstatus"] = null;

                            }


                            // reference
                            submissionGroup["desnz_submission"] = new EntityReference("desnz_submission", submission.Id);
                            // create submissionGroup
                            submissionGroup.Id = await serviceClient.CreateAsync(submissionGroup);

                        }
                    }

                    // END SUBMISSION /////////////////

                    _logger.LogInformation("New Submission created at {DT} with id :  {id}", DateTime.UtcNow.ToLongTimeString(), submission.Id.ToString());


                    return Ok(returnId.id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                CreateLogFun logEntry = new CreateLogFun(_serviceClientFactory);
                await logEntry.CreateFun(ControllerContext.ActionDescriptor.ControllerName, ex, User);

                ReplyMessage reply = new ReplyMessage();
                reply.message = "Internal Server Error Occurred";
                return StatusCode(StatusCodes.Status500InternalServerError, reply);
            }
        }

        public class RequestSubmission
        {
            public string? name { get; set; }                   // desnz_name
            public int? submissionFormType { get; set; }        // desnz_submissionformtype

            public string? year { get; set; }                   // desnz_year
            public string? version { get; set; }               // desnz_version

            public RequestSubScheme? scheme { get; set; }                 // desnz_scheme
            public bool? schemeApplyingForCertificationIsExisting { get; set; }    // desnz_schemeapplyingforcertificationisexisting

            //choice list 0 - 2
            public int? chpFuelBillingPeriod { get; set; }          // desnz_chpfuelbillingperiod

            public string? chpFuelBillingPeriodOther { get; set; }  // desnz_chpfuelbillingperiodother

            /*public bool? schemeLineDiagramExists { get; set; }     // desnz_schemelinediagramexists

            public bool? schemeEnergyFlowDiagramExists { get; set; }    // desnz_schemeenergyflowdiagramexists

            public bool? annualHeatProfileExists { get; set; }         // desnz_annualheatprofileexists

            public bool? dailyHeatProfileExists { get; set; }           // desnz_dailyheatprofileexists

            public bool? heatLoadDurationCurveExists { get; set; }     // desnz_heatloaddurationcurveexists*/

            //public decimal? powerEfficiencyThreshold { get; set; }  // desnz_thepowerefficiencythresholdforyourschemeis
            //public decimal? qualityIndexThreshold { get; set; }  // desnz_whatistheqithresholdforyourscheme




        }
        public class RequestSubScheme
        {
            public Guid? id { get; set; }                       // desnz_submissionid


        }
    }
}


