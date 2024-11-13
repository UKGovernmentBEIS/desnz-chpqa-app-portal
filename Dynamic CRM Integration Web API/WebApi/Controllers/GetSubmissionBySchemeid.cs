using Microsoft.AspNetCore.Mvc;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Swashbuckle.AspNetCore.Annotations;
using WebApi.Model;
using WebApi.Contracts;
using WebApi.Services;
using WebApi.Functions;

namespace WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    public class GetSubmissionBySchemeid : ControllerBase
    {
        private readonly ILogger<GetSubmissionBySchemeid> _logger;
        private readonly IServiceClientFactory _serviceClientFactory;
        public GetSubmissionBySchemeid(ILogger<GetSubmissionBySchemeid> logger, IServiceClientFactory serviceClientFactory)
        {
            _logger = logger;
            _serviceClientFactory = serviceClientFactory;
        }
        /// <summary>
        /// Retrieves Details of latest created Submission By Scheme id
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Todo
        ///     {
        ///         GetSubmissionBySchemeid?SchemeId=0d66d82b-bf2c-ef11-840a-000d3ade4f5e
        ///     }
        ///
        /// </remarks>
        /// <param name="data"></param>
        /// <returns></returns>
        /// <response code="200">Returns the Submission details</response>
        /// <response code="400">If the data is invalid</response>
        /// <response code="500">If there is a server error</response>
        [ProducesResponseType(typeof(ReplySubmission), 200)]
        [ProducesResponseType(typeof(ReplyMessage), 400)]
        [ProducesResponseType(typeof(ReplyMessage), 500)]
        [HttpGet("GetSubmissionBySchemeid")]
        [SwaggerOperation(Summary = "Get Submission Details By Scheme id", Description = "Retrieves Details of latest created Submission By Scheme id")]
        public async Task<ActionResult<ReplySubmission>> SubmissionDetailsBySchemeid(string SchemeId)
        {
            try
            {
                using (var serviceClient = _serviceClientFactory.CreateServiceClient())
                {
                    ReplySubmission submission = new ReplySubmission();

                    EntityReference EntityId = new EntityReference("desnz_scheme", new Guid(SchemeId));

                    QueryExpression query = new QueryExpression
                    {
                        EntityName = "desnz_submission", // Specify the name of the parent entity
                        ColumnSet = new ColumnSet(true),
                        Criteria = new FilterExpression
                        {
                            Conditions =
                                 {
                                     new ConditionExpression("desnz_scheme", ConditionOperator.Equal, EntityId.Id)
                                 }
                        },
                        LinkEntities =
                        {
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_submission", // Parent entity
                                LinkFromAttributeName = "desnz_policychpqa", // Parent entity attribute
                                LinkToEntityName = "desnz_schemepolicy", // Related entity
                                LinkToAttributeName = "desnz_schemepolicyid", // Related entity attribute
                                Columns = new ColumnSet("desnz_schemepolicyid", "desnz_name", "desnz_type", "desnz_latest"),
                                EntityAlias = "PolicyChpqa",
                            },
                            new LinkEntity
                            {
                                JoinOperator = JoinOperator.LeftOuter, // Inner join for related entity
                                LinkFromEntityName = "desnz_submission", // Parent entity
                                LinkFromAttributeName = "desnz_policyrocscfd", // Parent entity attribute
                                LinkToEntityName = "desnz_schemepolicy", // Related entity
                                LinkToAttributeName = "desnz_schemepolicyid", // Related entity attribute
                                Columns = new ColumnSet("desnz_schemepolicyid", "desnz_name", "desnz_type", "desnz_latest"),
                                EntityAlias = "PolicyRocsCfd",
                            }
                        },
                        Orders =
                        {
                            new OrderExpression("createdon", OrderType.Descending)
                        },
                        TopCount = 1
                    };

                    EntityCollection results = await serviceClient.RetrieveMultipleAsync(query);

                    //
                    if (!await AuthorizationService.ValidateUserData(User, serviceClient, EntityId.Id)) return StatusCode(StatusCodes.Status401Unauthorized);
                    //
                    


                    if (results.Entities.Count > 0)
                    {

                        
                        // policies
                        // policy CHPQA
                        AliasedValue policyChpqaId = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyChpqa.desnz_schemepolicyid"))
                        {
                            policyChpqaId = (AliasedValue)results.Entities[0]["PolicyChpqa.desnz_schemepolicyid"];
                        }
                        AliasedValue policyChpqaName = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyChpqa.desnz_name"))
                        {
                            policyChpqaName = (AliasedValue)results.Entities[0]["PolicyChpqa.desnz_name"];
                        }

                        AliasedValue policyChpqaType = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyChpqa.desnz_type"))
                        {
                            policyChpqaType = (AliasedValue)results.Entities[0]["PolicyChpqa.desnz_type"];
                        }

                        AliasedValue policyChpqaLatest = null;
                        if (results.Entities[0].Attributes.ContainsKey("PolicyChpqa.desnz_latest"))
                        {
                            policyChpqaLatest = (AliasedValue)results.Entities[0]["PolicyChpqa.desnz_latest"];
                        }
                        // policy CHPQA
                        submission.policyChpqa = new Policy();
                        submission.policyChpqa.id = policyChpqaId == null ? Guid.Empty : (Guid)policyChpqaId.Value;
                        submission.policyChpqa.name = policyChpqaName?.Value.ToString() ?? string.Empty;
                        submission.policyChpqa.type = null;
                        if (policyChpqaType?.Value is OptionSetValue optionSetPolicyChpqaValue)
                        {
                            submission.policyChpqa.type = optionSetPolicyChpqaValue.Value;
                        }
                        submission.policyChpqa.latest = policyChpqaLatest == null ? null : (bool)policyChpqaLatest.Value;

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
                        submission.policyRocsCfd = new Policy();
                        submission.policyRocsCfd.id = policyRocsCfdId == null ? Guid.Empty : (Guid)policyRocsCfdId.Value;
                        submission.policyRocsCfd.name = policyRocsCfdName?.Value.ToString() ?? string.Empty;
                        submission.policyRocsCfd.type = null;
                        if (policyRocsCfdType?.Value is OptionSetValue optionSetpolicyRocsCfdValue)
                        {
                            submission.policyRocsCfd.type = optionSetpolicyRocsCfdValue.Value;
                        }
                        submission.policyRocsCfd.latest = policyRocsCfdLatest == null ? null : (bool)policyRocsCfdLatest.Value;


                        // scheme
                        EntityReference schemeEntityRef = null;

                        if (results.Entities[0].Attributes.Contains("desnz_scheme") && results.Entities[0]["desnz_scheme"] != null)
                        {
                            schemeEntityRef = results.Entities[0]["desnz_scheme"] as EntityReference;
                        }

                        string schemeName = schemeEntityRef?.Name ?? string.Empty;
                        Guid schemeId = schemeEntityRef == null ? Guid.Empty : schemeEntityRef.Id;

                        submission.id = results.Entities[0].GetAttributeValue<Guid>("desnz_submissionid");
                        submission.name = results.Entities[0].GetAttributeValue<string>("desnz_name");
                        if (results.Entities[0].Attributes.ContainsKey("desnz_submissionformtype") && results.Entities[0]["desnz_submissionformtype"] is OptionSetValue optionSetValueSubmissionFormType)
                        {
                            submission.submissionFormType = optionSetValueSubmissionFormType.Value;
                        }
                        submission.year = results.Entities[0].GetAttributeValue<string?>("desnz_year");
                        submission.version = results.Entities[0].GetAttributeValue<string?>("desnz_version");
                        if (results.Entities[0].Attributes.ContainsKey("desnz_status") && results.Entities[0]["desnz_status"] is OptionSetValue optionSetValueSubmissionStatus)
                        {
                            submission.status = optionSetValueSubmissionStatus.Value;
                        }

                        // F1
                        submission.scheme = new RequestShceme();
                        submission.scheme.id = schemeId;
                        submission.scheme.name = schemeName;
                        submission.scheme.reference = schemeName;

                        // F2
                        submission.schemeApplyingForCertificationIsExisting = results.Entities[0].GetAttributeValue<bool?>("desnz_schemeapplyingforcertificationisexisting");

                        if (results.Entities[0].Attributes.ContainsKey("desnz_chpfuelbillingperiod") && results.Entities[0]["desnz_chpfuelbillingperiod"] is OptionSetValue optionSetValueChpFuelBillingPeriod)
                        {
                            submission.chpFuelBillingPeriod = optionSetValueChpFuelBillingPeriod.Value;
                        }

                        //submission.chpFuelBillingPeriod = entity.GetAttributeValue<int>("desnz_chpfuelbillingperiod");
                        submission.chpFuelBillingPeriodOther = results.Entities[0].GetAttributeValue<string?>("desnz_chpfuelbillingperiodother");

                        submission.schemeLineDiagramExists = results.Entities[0].GetAttributeValue<bool?>("desnz_schemelinediagramexists");
                        submission.schemeEnergyFlowDiagramExists = results.Entities[0].GetAttributeValue<bool?>("desnz_schemeenergyflowdiagramexists");
                        submission.annualHeatProfileExists = results.Entities[0].GetAttributeValue<bool?>("desnz_annualheatprofileexists");
                        submission.dailyHeatProfileExists = results.Entities[0].GetAttributeValue<bool?>("desnz_dailyheatprofileexists");
                        submission.heatLoadDurationCurveExists = results.Entities[0].GetAttributeValue<bool?>("desnz_heatloaddurationcurveexists");

                        submission.chpTotalPowerCapacity = results.Entities[0].GetAttributeValue<double?>("desnz_chptotalpowercapacity");
                        //submission.chpTotalHeatCapacity = results.Entities[0].GetAttributeValue<double>("desnz_chptotalheatcapacity");
                        submission.chpMaxHeat = results.Entities[0].GetAttributeValue<double?>("desnz_chpmaxheat");

                        submission.totalPowCapUnderMaxHeatConds = results.Entities[0].GetAttributeValue<double?>("desnz_totalpowcapundermaxheatconds");
                        submission.totalKweNormRun = results.Entities[0].GetAttributeValue<double?>("desnz_totalkwenormrun");
                        submission.totalKwthNormRun = results.Entities[0].GetAttributeValue<double?>("desnz_totalkwthnormrun");

                        submission.hoursOfOperation = results.Entities[0].GetAttributeValue<decimal?>("desnz_hoursofoperation");
                        submission.months = results.Entities[0].GetAttributeValue<int?>("desnz_months");

                        submission.totalFuelEnergyInputs = results.Entities[0].GetAttributeValue<decimal?>("desnz_totalfuelandenergyinputsmwh");
                        submission.estimatedTotalFuelEnergyPrimeEngines = results.Entities[0].GetAttributeValue<decimal?>("desnz_estimatedtotalfuelandenergyinputsused");
                        submission.estimatedTotalFuelEnergyBoilers = results.Entities[0].GetAttributeValue<decimal?>("desnz_estiamatedtotalfuelandenergyinputs");

                        submission.totalPowerGenerated = results.Entities[0].GetAttributeValue<decimal?>("desnz_totalpowergeneratedmwh");
                        submission.totalPowerExported = results.Entities[0].GetAttributeValue<decimal?>("desnz_totalpowerexportedmwh");
                        submission.totalPowerImported = results.Entities[0].GetAttributeValue<decimal?>("desnz_totalpowerimportedbysitethroughmwh");

                        submission.heatRejectionFacility = results.Entities[0].GetAttributeValue<bool?>("desnz_heatrejectionfacility");
                        submission.qualifyingHeatOutput = results.Entities[0].GetAttributeValue<decimal?>("desnz_qualifyingheatoutputmwh");
                        submission.totalHeatExported = results.Entities[0].GetAttributeValue<decimal?>("desnz_totalheatexported");

                        submission.powerEfficiencyThreshold = results.Entities[0].GetAttributeValue<decimal?>("desnz_thepowerefficiencythresholdforyourschemeis"); ;
                        submission.achivePowerEfficiencyThreshold = results.Entities[0].GetAttributeValue<bool?>("desnz_didyourschemeachievethepowerefficiencythres"); ;
                        submission.powerEfficiency = results.Entities[0].GetAttributeValue<decimal?>("desnz_power");
                        submission.heatEfficiency = results.Entities[0].GetAttributeValue<decimal?>("desnz_heat");

                        submission.sosCertificate = results.Entities[0].GetAttributeValue<bool?>("desnz_needasoscertificate");
                        submission.cfdCertificate = results.Entities[0].GetAttributeValue<bool?>("desnz_needacontractsfordifferencecertificate");
                        submission.rocsCertificate = results.Entities[0].GetAttributeValue<bool?>("desnz_needanrenewablesobligationcertificate");

                        submission.sumFnX = results.Entities[0].GetAttributeValue<decimal?>("desnz_weightedfactorfnxx");
                        submission.sumFnY = results.Entities[0].GetAttributeValue<decimal?>("desnz_weightedfactorfnxy");
                        submission.qualityIndex = results.Entities[0].GetAttributeValue<decimal?>("desnz_qualityindex");
                        submission.qualityIndexThreshold = results.Entities[0].GetAttributeValue<decimal?>("desnz_whatistheqithresholdforyourscheme");
                        submission.qualityIndexThresholdAchived = results.Entities[0].GetAttributeValue<bool?>("desnz_didyourschemeachievetheqithreshold");

                        submission.annualClimateChangeLevyAmount = results.Entities[0].GetAttributeValue<decimal?>("desnz_annualclimatechangelevyamount");
                        submission.annualCarbonPriceSupportAmount = results.Entities[0].GetAttributeValue<decimal?>("desnz_annualcarbonpricesupportamount");
                        submission.annualRenewableHeatIncentiveUpliftAmount = results.Entities[0].GetAttributeValue<decimal?>("desnz_annualrenewableheatincentiveupliftamount");
                        submission.annualRenewablesObligationCertificateAmount = results.Entities[0].GetAttributeValue<decimal?>("desnz_annualrenewablesobligrationcertificateamount");
                        submission.annualContractsForDifferenceAmount = results.Entities[0].GetAttributeValue<decimal?>("desnz_annualcontractsfordifferenceamount");
                        submission.annualBusinessRatesReductionAmount = results.Entities[0].GetAttributeValue<decimal?>("desnz_annualbusinessratesreductionamount");

                        submission.estimatedTotalHeatOutputUsedInthePrimeMovers = results.Entities[0].GetAttributeValue<decimal?>("desnz_estimatedqualifyheatoutputfromprimemover");
                        submission.estimatedTotalHeatOutputUsedIntheBoilers = results.Entities[0].GetAttributeValue<decimal?>("desnz_estimatedqualifiedheatoutputfromtheboilers");

                        submission.FOI = results.Entities[0].GetAttributeValue<decimal?>("desnz_foi");
                        submission.FOP = results.Entities[0].GetAttributeValue<decimal?>("desnz_fop");
                        submission.FOH = results.Entities[0].GetAttributeValue<decimal?>("desnz_foh");
                        submission.uncertaintyFactorComment = results.Entities[0].GetAttributeValue<string?>("desnz_uncertaintyfactorcomment");

                        submission.rocscfdSumFnX = results.Entities[0].GetAttributeValue<decimal?>("desnz_rocsweightedfactorfnxxsum");
                        submission.rocscfdsumFnY = results.Entities[0].GetAttributeValue<decimal?>("desnz_rocsweightedfactorfnxysum");
                        submission.rocscfdQualityIndex = results.Entities[0].GetAttributeValue<decimal?>("desnz_rocsqualityindex");
                        submission.rocscfdQualityIndexThresholdAchived = results.Entities[0].GetAttributeValue<bool?>("desnz_rocscfdqithresholdachieved");

                        submission.zRatioDetermined = results.Entities[0].GetAttributeValue<bool?>("desnz_isthezratioofthisschemedetermined");
                        submission.possibleToDetermineZRatio = results.Entities[0].GetAttributeValue<string?>("desnz_whyitisnotpossibletodeterminethezration");
                        submission.steamExportPressure = results.Entities[0].GetAttributeValue<decimal?>("desnz_steamexportpressure");
                        submission.steamturbinesize = results.Entities[0].GetAttributeValue<decimal?>("desnz_steamturbinesize");
                        submission.zratio = results.Entities[0].GetAttributeValue<decimal?>("desnz_zratio");

                        submission.schemeLineDiagramComments = results.Entities[0].GetAttributeValue<string?>("desnz_schemelinediagramcomments");
                        submission.energyFlowDiagramComments = results.Entities[0].GetAttributeValue<string?>("desnz_energyflowdiagramcomments");
                        submission.annualHeatProfileComments = results.Entities[0].GetAttributeValue<string?>("desnz_annualheatprofilecomments");
                        submission.dailyHeatProfileComments = results.Entities[0].GetAttributeValue<string?>("desnz_dailyheatprofilecomments");
                        submission.heatLoadDurationCurveComments = results.Entities[0].GetAttributeValue<string?>("desnz_heatloaddurationcurvecomments");
                        submission.RPComments = results.Entities[0].GetAttributeValue<string?>("desnz_rpcomments");

                        //TODO get more attributes


                        //Get User`s Role // User Type
                        int userRole = await GetUserRoleFun.GetRoleOfUser(User, serviceClient);

                        //get groups for specific user (UserType with UserRole check)
                        List<ReplySubmissionGroups> groups = new List<ReplySubmissionGroups>();

                        // Gets submissionId, userType, serviceClient // Returns groups apropriate for that type of user.
                        groups = await GetSubmissionGroupsFun.GetSubmissionGroups(submission.id ?? Guid.Empty, userRole, submission.status ?? (int)Submission.SubmissionStatus.NotStarted, serviceClient);

                        submission.sectionStatusList = new List<ReplySubmissionGroups>();

                        submission.sectionStatusList = groups; // Result GROUP list of function

                    }

                    return Ok(submission);
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

    }
}
