using WebApi.Model;

namespace WebApi.Contracts
{
    public class ReplySubmission
    {
        #region General Fields

        public Guid? id { get; set; }

        public string? name { get; set; }

        public int? submissionFormType { get; set; }

        public string? year { get; set; }
        public string? version { get; set; }

        public RequestShceme? scheme { get; set; }
        public Policy? policyChpqa { get; set; }            // desnz_policychpqa
        public Policy? policyRocsCfd { get; set; }          // desnz_policyrocscfd
        public int? status { get; set; }                    // desnz_status

        #endregion

        #region F2/F2s Fields

        public bool? schemeApplyingForCertificationIsExisting { get; set; }

        //choice list 0 - 2
        public int? chpFuelBillingPeriod { get; set; }

        public string? chpFuelBillingPeriodOther { get; set; }

        public bool? schemeLineDiagramExists { get; set; }

        public bool? schemeEnergyFlowDiagramExists { get; set; }

        public bool? annualHeatProfileExists { get; set; }

        public bool? dailyHeatProfileExists { get; set; }

        public bool? heatLoadDurationCurveExists { get; set; }

        public List<ReplySubmissionGroups>? sectionStatusList { get; set; }

        public double? chpTotalPowerCapacity { get; set; }

        //public double? chpTotalHeatCapacity { get; set; }

        public double? chpMaxHeat { get; set; }

        public double? totalPowCapUnderMaxHeatConds { get; set; }

        public double? totalKweNormRun { get; set; }
        public double? totalKwthNormRun { get; set; }

        //Comments
        public string? schemeLineDiagramComments { get; set; }      // desnz_schemelinediagramcomments
        public string? energyFlowDiagramComments { get; set; }      // desnz_energyflowdiagramcomments
        public string? annualHeatProfileComments { get; set; }      // desnz_annualheatprofilecomments
        public string? dailyHeatProfileComments { get; set; }       // desnz_dailyheatprofilecomments
        public string? heatLoadDurationCurveComments { get; set; }  // desnz_heatloaddurationcurvecomments
        public string? RPComments { get; set; }  // desnz_RPComments

        #endregion


        #region F4/F4s Fields

        public decimal? hoursOfOperation { get; set; }      // desnz_hoursofoperation
        public int? months { get; set; }                // desnz_months

        // energy inputs
        public decimal? totalFuelEnergyInputs { get; set; }    // desnz_totalfuelandenergyinputsmwh
        public decimal? estimatedTotalFuelEnergyPrimeEngines { get; set; }   // desnz_estimatedtotalfuelandenergyinputsused
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
