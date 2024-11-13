using static System.Runtime.InteropServices.JavaScript.JSType;
using static WebApi.Model.SubmissionGroups;

namespace WebApi.Model
{
    public class SubmissionGroups                       // desnz_group
    {

        public Guid? id { get; set; }                                                   // desnz_groupid
        public string? name { get; set; }                                               // desnz_name
        public string? submittedName { get; set; }                                      // desnz_submittedname
        public int? groupCategory { get; set; }                                         // desnz_groupcategory
        public int? groupType { get; set; }                                             // desnz_grouptype
        public bool? statusLocked { get; set; }                                         // desnz_statuslocked
        public int? status { get; set; }                                                // desnz_status
        public int? displayOrder { get; set; }                                          // desnz_displayorder
        public int? assessorStatus { get; set; }                                        // desnz_assessorstatus
        public int? userRole { get; set; }                                              // desnz_userrole
        public Person? assessor { get; set; }                                           // desnz_assessor
        public Submission? submission { get; set; }                                     // desnz_submission
        public List<SubmissionGroupDetails>? submissionGroupDetailsList { get; set; }   // desnz_groupdetail

       
        public enum AssessorStatus
        {
            NotStarted = 0,
            Approved = 1,
            NeedsChange = 2,
            Rejected = 3,
            CannotStartYet = 4,
            Completed = 5,
            NotApplicable = 6

        }

        public enum GroupCategory
        {

            // ALL
            SchemeDetails = 0,
            SchemeCapacityDetails = 1,
            SchemePerformanceDetails = 2,
            CertificatesAndBenefitsDetails = 3,
            ThresholdDetails = 4,

            // RP
            SubmitToAssessor = 5,


            // TA1, TA2
            CompleteAssessment = 6,

            // RP return for changes
            ReturnToAssessor = 7,

            // RP, TA2
            AssessorComments = 10,

            // AA, TA2
            AssignSchemeAndSetPolicy = 11,



        }

        public enum GroupType
        {
            

            // 0 to 14
            ReviewRpAndSiteContact = 0,
            // EconomicSector = 1,  // or sic code have to rework it in future sprint!
            UploadSchemeLineDiagram = 1,
            UploadEnergyFlowDiagram = 2,
            UploadAnnualHeatProfile = 3,
            UploadDailyHeatProfile = 4,
            UploadHeatLoadDurationCurve = 5,
            AddPrimeMoverDetails = 6,
            AddMeterDetails = 7,
            AddHeatRejectionFacilityDetails = 8,

            // 15 to 20
            ChpTotalPowerCapacity = 15,
            ChpMaxHeat = 16,
            TotalPowerCapUnderMaxHeatConditions = 17,

            //21 to 30
            ProvideHoursOfOperation = 21,
            ProvideEnergyInputs = 22,
            ProvidePowerOutputs = 23,
            ProvideHeatOutputs = 24,
            ProvideUncertaintyFactors = 25,
            ProvideCondensingSteamTurbineDetails = 26,

            // 31 to 40
            SecretaryOfStateExemptionCertificate = 31,
            RenewablesObligationCertificate = 33,
            ContractsForDifferenceCertificate = 34,
            ProvideInformationFinancialBenefits = 35,

            // 41 to 50
            QualityIndexThreshold = 41,
            PowerEfficiencyStatus = 42,
            QualityindexStatus = 43,
            RocQualityIndexStatus = 44,
            CfdQualityIndexStatus = 45,

            // RP
            // 51
            SubmitToAssessor = 51,

            // TA1
            // 61
            AuditRecommendation = 61,
            SubmitAssessment = 62,


            // TA2
            // 71
            AssessmentDecision = 71,
            ReviewAssessorCommentsTA2 = 72,


            // RP return for changes
            // 100 to 110
            ReviewAssessorCommentsRP = 100,
            ReturnToAssessor = 101,

            // Assessor Admin
            // 111 to 120
            AssignSchemeForAssessment = 111,
            ReturnSchemeToRpFromAA = 112,
            SetPoliciesAndThermalEfficiency = 113,




        }

        public enum GroupTypeOnlyForReturndForChanges
        {
            ReviewAssessorCommentsRP = GroupType.ReviewAssessorCommentsRP,
            ReturnToAssessor = GroupType.ReturnToAssessor,
        }

        public enum GroupTypeOnlyForSubmitAssessment
        {
            SubmitToAssessor = GroupType.SubmitToAssessor,
            
        }

        public enum GroupTypeWithNoStatus
        {
            ChpTotalPowerCapacity = GroupType.ChpTotalPowerCapacity,
            ChpMaxHeat = GroupType.ChpMaxHeat,
            PowerEfficiencyStatus = GroupType.PowerEfficiencyStatus,
            QualityindexStatus = GroupType.QualityindexStatus,
            RocQualityIndexStatus = GroupType.RocQualityIndexStatus,
            CfdQualityIndexStatus = GroupType.CfdQualityIndexStatus
        }

        public enum GroupTypeWithNotApplicapleStatus
        {
            ProvideEnergyInputs = GroupType.ProvideEnergyInputs,
            ProvidePowerOutputs = GroupType.ProvidePowerOutputs,
            ProvideHeatOutputs = GroupType.ProvideHeatOutputs
        }

        public enum GroupTypeWithNoAssessorStatusInApiCall
        {
            SecretaryOfStateExemptionCertificate = GroupType.SecretaryOfStateExemptionCertificate,
            RenewablesObligationCertificate = GroupType.RenewablesObligationCertificate,
            ContractsForDifferenceCertificate = GroupType.ContractsForDifferenceCertificate,
            ProvideInformationFinancialBenefits = GroupType.ProvideInformationFinancialBenefits,

        }

        public enum StatusType
        {
            NotStarted = 0,
            InProgress = 1,
            Completed = 2,
            CannotStartYet = 3,
            NotApplicable = 4
        }

        public enum GroupUserRole
        {
            All = 0,
            RP = 1,
            TA1 = 2,
            TA2 = 3,
            TA1_TA2 = 4,
            AA = 5,
            AA_TA2 = 6,


        }

    }
    

    public struct DictionaryNames
    {
        public string? name {  get; set; }
        public string? submittedName { get; set; }
        public int? userRole { get; set; }
    }

    public class SubmissionGroupDiction
    {
        #region AA AND TA2
        // TODO FOR TA2 ALSO
        public Dictionary<int, DictionaryNames> groupDictAssignSchemeAndSetPolicy = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.AssignSchemeForAssessment, new DictionaryNames { name = "Assign scheme for assessment", submittedName =  "Assign scheme for assessment", userRole = (int)GroupUserRole.AA } },
            { (int)GroupType.ReturnSchemeToRpFromAA, new DictionaryNames { name = "Return scheme to RP (optional)", submittedName =  "Return scheme to RP (optional)", userRole = (int)GroupUserRole.AA } },
            { (int)GroupType.SetPoliciesAndThermalEfficiency, new DictionaryNames { name = "Set policies and thermal efficiency (optional)", submittedName =  "Set policies and thermal efficiency (optional)", userRole = (int)GroupUserRole.AA } }
        };

        #endregion

        #region RP AND TA2

        public Dictionary<int, DictionaryNames> groupDictAssessorComments = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ReviewAssessorCommentsRP, new DictionaryNames { name = "Review assessor comments", submittedName =  "Review assessor comments", userRole = (int)GroupUserRole.RP } },
            { (int)GroupType.ReviewAssessorCommentsTA2, new DictionaryNames { name = "Review assessor comments", submittedName =  "Review assessor comments", userRole = (int)GroupUserRole.TA2 } }
        };

        #endregion

        # region Responsible Person

        public Dictionary<int, DictionaryNames> groupDictSubmitToAssessor = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.SubmitToAssessor, new DictionaryNames { name = "Submit to assessor", submittedName =  "Submit to assessor", userRole = (int)GroupUserRole.RP } }
        };

        public Dictionary<int, DictionaryNames> groupDictReturnToAssessor = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ReturnToAssessor, new DictionaryNames { name = "Return to assessor", submittedName =  "Return to assessor", userRole = (int)GroupUserRole.RP } }
        };

        #endregion

        #region TA2


        #endregion

        #region TA1 AND TA2

        public Dictionary<int, DictionaryNames> groupDictCompleteAssessment = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.AuditRecommendation, new DictionaryNames { name = "Provide audit recommendation", submittedName =  "Review audit recommendation", userRole = (int)GroupUserRole.TA1_TA2 } },
            { (int)GroupType.SubmitAssessment, new DictionaryNames { name = "Submit assessmemt", submittedName =  "Submit assessment", userRole = (int)GroupUserRole.TA1 } },
            { (int)GroupType.AssessmentDecision, new DictionaryNames { name = "Provide assessment decision", submittedName =  "Review assessment decision", userRole = (int)GroupUserRole.TA2 } },

        };

        #endregion




        #region Complex

        public Dictionary<int, DictionaryNames> groupDictSchemeDetails = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ReviewRpAndSiteContact, new DictionaryNames { name = "Confirm RP and site contact", submittedName =  "Review RP and site contact", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.UploadSchemeLineDiagram, new DictionaryNames { name = "Upload scheme line diagram", submittedName =  "Review scheme line diagram", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.UploadEnergyFlowDiagram, new DictionaryNames { name =  "Upload energy flow diagram", submittedName =  "Review energy flow diagram", userRole = (int)GroupUserRole.All} },
            { (int)GroupType.UploadAnnualHeatProfile, new DictionaryNames { name = "Upload annual heat profile",  submittedName =  "Review annual heat profile", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.UploadDailyHeatProfile, new DictionaryNames { name = "Upload daily heat profile", submittedName =  "Review daily heat profile", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.UploadHeatLoadDurationCurve, new DictionaryNames { name = "Upload heat load duration curve", submittedName =  "Review heat load duration curve", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.AddPrimeMoverDetails, new DictionaryNames { name = "Add prime mover details", submittedName =  "Review prime mover details", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.AddMeterDetails, new DictionaryNames { name = "Add meter details", submittedName =  "Review meter details", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictSchemeCapDetails = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ChpTotalPowerCapacity, new DictionaryNames { name = "CHP total power capacity", submittedName =  "CHP total power capacity", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ChpMaxHeat, new DictionaryNames { name = "CHP MaxHeat", submittedName =  "CHP MaxHeat" } },
            { (int)GroupType.TotalPowerCapUnderMaxHeatConditions, new DictionaryNames { name = "Provide total power capacity under MaxHeat conditions", submittedName =  "Review total power capacity under MaxHeat conditions", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictSchemePerfDetails = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ProvideHoursOfOperation, new DictionaryNames { name =  "Provide hours of operation", submittedName =  "Review hours of operation", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideEnergyInputs, new DictionaryNames { name = "Provide energy inputs", submittedName =  "Review energy inputs", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvidePowerOutputs, new DictionaryNames { name = "Provide power outputs", submittedName =  "Review power outputs", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideHeatOutputs, new DictionaryNames { name = "Provide heat outputs", submittedName =  "Review heat outputs", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideUncertaintyFactors, new DictionaryNames { name = "Provide uncertainty factors", submittedName =  "Review uncertainty factors", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideCondensingSteamTurbineDetails, new DictionaryNames { name = "Provide condensing steam turbine details", submittedName =  "Review condensing steam turbine details", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictRocCertifAndBenefitsDetails = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.SecretaryOfStateExemptionCertificate, new DictionaryNames { name = "Secretary of State Exemption Certificate", submittedName =  "Secretary of State Exemption Certificate", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.RenewablesObligationCertificate, new DictionaryNames { name = "Request Renewables Obligation certificate", submittedName =  "Renewables Obligation certificate", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideInformationFinancialBenefits, new DictionaryNames { name = "Provide information about your financial benefits (optional)", submittedName =  "Review information about your financial benefits (optional)", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictCfdCertifAndBenefitsDetails = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.SecretaryOfStateExemptionCertificate, new DictionaryNames { name = "Secretary of State Exemption Certificate", submittedName =  "Secretary of State Exemption Certificate", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ContractsForDifferenceCertificate, new DictionaryNames { name = "Request Contracts for Difference certificate", submittedName =  "Contracts for Difference certificate", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideInformationFinancialBenefits, new DictionaryNames { name = "Provide information about your financial benefits (optional)", submittedName =  "Review information about your financial benefits (optional)", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictRocThresholdDetails = new Dictionary<int, DictionaryNames>()
        {

            { (int)GroupType.QualityIndexThreshold, new DictionaryNames { name = "Select quality index threshold", submittedName =  "Review quality index threshold", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.PowerEfficiencyStatus, new DictionaryNames { name = "Power efficiency status", submittedName =  "Power efficiency status", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.QualityindexStatus, new DictionaryNames { name = "Quality index status", submittedName =  "Quality index status", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.RocQualityIndexStatus, new DictionaryNames { name = "ROC quality index status", submittedName = "ROC quality index status", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictCfdThresholdDetails = new Dictionary<int, DictionaryNames>()
        {

            { (int)GroupType.QualityIndexThreshold, new DictionaryNames { name = "Select quality index threshold", submittedName =  "Review quality index threshold", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.PowerEfficiencyStatus, new DictionaryNames { name = "Power efficiency status", submittedName =  "Power efficiency status", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.QualityindexStatus, new DictionaryNames { name = "Quality index status", submittedName =  "Quality index status", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.CfdQualityIndexStatus, new DictionaryNames { name = "CFD quality index status", submittedName = "CFD quality index status", userRole = (int)GroupUserRole.All } }
        };

        #endregion




        #region Simple

        public Dictionary<int, DictionaryNames> groupDictSchemeDetailsSimple = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ReviewRpAndSiteContact, new DictionaryNames { name = "Confirm RP and site contact", submittedName =  "Review RP and site contact", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.UploadEnergyFlowDiagram, new DictionaryNames { name =  "Upload energy flow diagram", submittedName =  "Review energy flow diagram", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.AddPrimeMoverDetails, new DictionaryNames { name = "Add prime mover details", submittedName =  "Review prime mover details", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.AddMeterDetails, new DictionaryNames { name = "Add meter details", submittedName =  "Review meter details", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.AddHeatRejectionFacilityDetails, new DictionaryNames { name = "Add heat rejection facility details", submittedName =  "Review heat rejection facility details", userRole = (int)GroupUserRole.All } }
            
        };

        public Dictionary<int, DictionaryNames> groupDictSchemeCapDetailsSimple = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ChpTotalPowerCapacity, new DictionaryNames { name = "CHP total power capacity", submittedName =  "CHP total power capacity", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ChpMaxHeat, new DictionaryNames { name = "CHP MaxHeat", submittedName =  "CHP MaxHeat", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictSchemePerfDetailsSimple = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.ProvideHoursOfOperation, new DictionaryNames { name =  "Provide hours of operation", submittedName =  "Review hours of operation", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideEnergyInputs, new DictionaryNames { name = "Provide energy inputs", submittedName =  "Review energy inputs", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvidePowerOutputs, new DictionaryNames { name = "Provide power outputs", submittedName =  "Review power outputs", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideHeatOutputs, new DictionaryNames { name = "Provide heat outputs", submittedName =  "Review heat outputs", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictCertifAndBenefitsDetailsSimple = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.SecretaryOfStateExemptionCertificate, new DictionaryNames { name = "Secretary of State Exemption Certificate", submittedName =  "Secretary of State Exemption Certificate", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.ProvideInformationFinancialBenefits, new DictionaryNames { name = "Provide information about your financial benefits (optional)", submittedName =  "Review information about your financial benefits (optional)", userRole = (int)GroupUserRole.All } }
        };

        public Dictionary<int, DictionaryNames> groupDictThresholdDetailsSimple = new Dictionary<int, DictionaryNames>()
        {
            { (int)GroupType.QualityIndexThreshold, new DictionaryNames { name = "Select quality index threshold", submittedName =  "Review quality index threshold", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.PowerEfficiencyStatus, new DictionaryNames { name = "Power efficiency status", submittedName =  "Power efficiency status", userRole = (int)GroupUserRole.All } },
            { (int)GroupType.QualityindexStatus, new DictionaryNames { name = "Quality index status", submittedName =  "Quality index status", userRole = (int)GroupUserRole.All } }
        };

        #endregion

    }



}
