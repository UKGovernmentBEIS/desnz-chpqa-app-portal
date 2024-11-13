namespace WebApi.Model
{
    public class Submission                                 // desnz_submission
    {

        #region General Fields

        /// <summary>
        /// Do not need on Create Submission
        /// </summary>
        public Guid? id { get; set; }                       // desnz_submissionid

        public string? name { get; set; }                   // desnz_name

        /*  
         *  choice list 
         *  F2  = 0
         *  F2s = 1
         *  F3  = 2
         *  F4  = 3
         *  F4s = 4
        */
        public enum SubmissionFormType
        {
            F2 = 0,
            F2s = 1,
            F3 = 2,
            F4 = 3,
            F4s = 4
        }
        public int? submissionFormType { get; set; }        // desnz_submissionformtype

        public string? year { get; set; }                   // desnz_year
        public string? version { get; set; }               // desnz_version

        public Scheme? scheme { get; set; }                 // desnz_scheme

        public Policy? policyChpqa { get; set; }            // desnz_policychpqa
        public Policy? policyRocsCfd { get; set; }          // desnz_policyrocscfd
        public int? status { get; set; }                    // desnz_status

        public enum SubmissionStatus
        {
            NotStarted = 0,
            InProgress = 1,
            ReturnedForChanges = 2,
            DueForRenewal = 3,
            Submitted = 4,
            UnderReview = 5,
            Certified  = 6,
            NewMessage = 7,
            Rejected = 8,
            Expired = 9,
            Approved = 10,
            ReturnedForReassessment = 11,

            Unassinged = 12,
            ReturnToRPFromAA = 13,

        }

        // stores the decision of second assessment
        public int? assessorResult { get; set; }                    // desnz_assessorresult


        #endregion

        #region F2/F2s Fields


        public bool? schemeApplyingForCertificationIsExisting { get; set; }    // desnz_schemeapplyingforcertificationisexisting

        //choice list 0 - 2
        public enum FuelBillingPeriodType
        {
            Quarterly = 0,
            Monthly = 1,
            Other = 2
        }
        public int? chpFuelBillingPeriod { get; set; }          // desnz_chpfuelbillingperiod

        public string? chpFuelBillingPeriodOther { get; set; }  // desnz_chpfuelbillingperiodother

        public bool? schemeLineDiagramExists { get; set; }     // desnz_schemelinediagramexists

        public bool? schemeEnergyFlowDiagramExists { get; set; }    // desnz_schemeenergyflowdiagramexists

        public bool? annualHeatProfileExists { get; set; }         // desnz_annualheatprofileexists

        public bool? dailyHeatProfileExists { get; set; }           // desnz_dailyheatprofileexists

        public bool? heatLoadDurationCurveExists { get; set; }     // desnz_heatloaddurationcurveexists

        //public List<SubmissionDiagramsFiles>? submissionDiagramsFiles { get; set; }     // desnz_submissiondiagramsfiles


        public List<SubmissionGroups>? sectionStatusList { get; set; }         // desnz_group



        public List<Equipment>? equipmentList { get; set; }         // desnz_primemovers

        // sum of power capacities of equipment list
        public double? chpTotalPowerCapacity { get; set; }         // desnz_chptotalpowercapacity

        public List<Meter>? meterList { get; set; }                 // desnz_fuelmeters


        // F2s FIELD
        //public double? chpTotalHeatCapacity {  get; set; }          // desnz_chptotalheatcapacity


        public double? chpMaxHeat { get; set; }                    // desnz_chpmaxheat

        public double? totalPowCapUnderMaxHeatConds { get; set; }  // desnz_totalpowcapundermaxheatconds


        public List<AdditionalEquipment>? additionalEquipmentList { get; set; }     // desnz_additionalequipment


        public double? totalKweNormRun { get; set; }                // desnz_totalkwenormrun

        public double? totalKwthNormRun { get; set; }               // desnz_totalkwthnormrun

        // Diagram Comments
        public string? schemeLineDiagramComments { get; set; }      // desnz_schemelinediagramcomments
        public string? energyFlowDiagramComments { get; set; }      // desnz_energyflowdiagramcomments
        public string? annualHeatProfileComments { get; set; }      // desnz_annualheatprofilecomments
        public string? dailyHeatProfileComments { get; set; }       // desnz_dailyheatprofilecomments
        public string? heatLoadDurationCurveComments { get; set; }  // desnz_heatloaddurationcurvecomments
        public string? ReturnToAssessorComments { get; set; }  // desnz_heatloaddurationcurvecomments
        public enum DiagramType
        {
            SchemeEnergyFlowDiagram = 0,
            SchemeLineDiagram = 1,
            AnnualHeatProfile = 2,
            DailyHeatProfile = 3,
            HeatLoadDurationCurve = 4,
            UncertaintyFactor=5,
            ReturnToAssessor=6
        }

        public enum FilesType
        {
            SchemeEnergyFlowDiagram = 0,
            SchemeLineDiagram = 1,
            AnnualHeatProfile = 2,
            DailyHeatProfile = 3,
            HeatLoadDurationCurve = 4,
            UncertaintyFactor = 5,
        }

        #endregion


        #region F4/F4s Fields

        public decimal? hoursOfOperation { get; set; }      // desnz_hoursofoperation
        public int? months { get; set; }                // desnz_months

        // energy inputs
        public decimal? totalFuelEnergyInputs { get; set; }    // desnz_totalfuelandenergyinputsmwh
        public decimal? estimatedTotalFuelEnergyPrimeEngines{ get; set; }   // desnz_estimatedtotalfuelandenergyinputsused
        public decimal? estimatedTotalFuelEnergyBoilers { get; set; }   // desnz_estiamatedtotalfuelandenergyinputs

        // power outputs
        public decimal? totalPowerGenerated { get; set; }    // desnz_totalpowergeneratedmwh
        public decimal? totalPowerExported { get; set; }    // desnz_totalpowerexportedmwh
        public decimal? totalPowerImported { get; set; }    // desnz_totalpowerimportedbysitethroughmwh

        // heat outputs
        public bool? heatRejectionFacility { get; set; }        // desnz_heatrejectionfacility
        public decimal? qualifyingHeatOutput { get; set; }    // desnz_qualifyingheatoutputmwh
        public decimal? totalHeatExported { get; set; }    // desnz_totalheatexported
        public decimal? estimatedTotalHeatOutputUsedInthePrimeMovers { get; set; }  // desnz_estimatedqualifyheatoutputfromprimemover
        public decimal? estimatedTotalHeatOutputUsedIntheBoilers { get; set; }      // desnz_estimatedqualifiedheatoutputfromtheboilers

        // efficiencies
        public decimal? powerEfficiencyThreshold { get; set; }  // desnz_thepowerefficiencythresholdforyourschemeis
        public bool? achivePowerEfficiencyThreshold { get; set; }  // desnz_didyourschemeachievethepowerefficiencythres
        public decimal? powerEfficiency { get; set; }    // desnz_power
        public decimal? heatEfficiency { get; set; }    // desnz_heat

        // SoS
        public bool? sosCertificate { get; set; }    // desnz_needasoscertificate
        public bool? rocsCertificate { get; set; }       // desnz_needanrenewablesobligationcertificate
        public bool? cfdCertificate { get; set; }       // desnz_needacontractsfordifferencecertificate

        // QI
        public decimal? sumFnX { get; set; }        // desnz_weightedfactorfnxx
        public decimal? sumFnY { get; set; }        // desnz_weightedfactorfnxy
        public decimal? qualityIndex { get; set; }        // desnz_qualityindex
        public decimal? qualityIndexThreshold { get; set; }        // desnz_whatistheqithresholdforyourscheme
        public bool? qualityIndexThresholdAchived { get; set; }        // desnz_didyourschemeachievetheqithreshold

        // financial benefits
        public decimal? annualClimateChangeLevyAmount { get; set; }         // desnz_annualclimatechangelevyamount
        public decimal? annualCarbonPriceSupportAmount { get; set; }         // desnz_annualcarbonpricesupportamount
        public decimal? annualRenewableHeatIncentiveUpliftAmount { get; set; }         // desnz_annualrenewableheatincentiveupliftamount
        public decimal? annualRenewablesObligationCertificateAmount { get; set; }         // desnz_annualrenewablesobligrationcertificateamount
        public decimal? annualContractsForDifferenceAmount { get; set; }         // desnz_annualcontractsfordifferenceamount
        public decimal? annualBusinessRatesReductionAmount { get; set; }         // desnz_annualbusinessratesreductionamount

        // Uncertanty Factors
        public decimal? FOI { get; set; }       // desnz_foi
        public decimal? FOP { get; set; }       // desnz_fop
        public decimal? FOH { get; set; }       // desnz_foh
        public string? uncertaintyFactorComment { get; set; }    // desnz_uncertaintyfactorcomment

        // ROCs/CFD QI
        public decimal? rocscfdSumFnX { get; set; }        // desnz_rocsweightedfactorfnxxsum
        public decimal? rocscfdsumFnY { get; set; }        // desnz_rocsweightedfactorfnxysum
        public decimal? rocscfdQualityIndex { get; set; }        // desnz_rocsqualityindex
        public bool? rocscfdQualityIndexThresholdAchived { get; set; }        // desnz_rocscfdqithresholdachieved

        //Z Ratio
        public bool? zRatioDetermined { get; set; }        //desnz_isthezratioofthisschemedetermined
        public string? possibleToDetermineZRatio { get; set; } //desnz_whyitisnotpossibletodeterminethezration
        public decimal? steamExportPressure { get; set; }       //desnz_steamexportpressure
        public decimal? steamturbinesize { get; set; }          //desnz_steamturbinesize
        public decimal? zratio { get; set; }                   //desnz_zratio

       

       

        #endregion

    }
}
