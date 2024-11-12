import { ASSESSOR_ROUTE_PATHS } from 'src/app/features/assessor/config/assessor-routes.config';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

export enum SubmissionGroupType {
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
  ProvideCondensingStreamTurbineDetails = 26,

  // 31 to 40
  SecretaryOfStateExemptionCertificate = 31,
  RenewablesObligationCertificate = 33,
  ContractsForDifferenceCertificate = 34,
  ProvideInformationFinancialBenefits = 35,

  // 41 to 50
  QualityIndexThreshold = 41,
  PowerEfficiencyStatus = 42,
  QualityIndexStatus = 43,
  RocQualityIndexStatus = 44,
  CfdQualityIndexStatus = 45,

  // 51
  SubmitToAssessor = 51,

  // Assessor - Complete assessment
  ProvideAuditRecommendation = 61,
  SubmitAssessment = 62,
  ProvideAssessmentDecision = 71,

  // Second Assessor
  ReviewAssessorComments = 72,

  // Assessor admin
  AssignSchemeForAssessment = 111,
  ReturnSchemeToRpFromAA = 112,
  SetPoliciesAndThermalEfficiency = 113,
}

export enum SubmissionGroupCategory {
  SchemeDetails = 0,
  SchemeCapacityDetails = 1,
  SchemePerformanceDetails = 2,
  CertificatesAndBenefitsDetails = 3,
  ThresholdDetails = 4,
  SubmitToAssessor = 5,
  CompleteAssessment = 6,
  AssessorComments = 10,
  AssignSchemeAndSetPolicy = 11,

}

export enum SubmissionFormType {
  F2_DEPRICATED = 0, //F2 is depricated. F4 should be used instead
  F2s_DEPRICATED = 1, //F2s is depricated. F4s should be used instead
  F3 = 2,
  F4 = 3,
  F4s = 4,
}

export enum SubmissionFormStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  CannotStartYet = 3,
}

export enum MeasureType {
  EnergyInput = 0,
  PowerOutput = 1,
  HeatOutput = 2,
}

export const SubmissionGroupTypeRoutes: {
  [key in SubmissionGroupType]: string;
} = {
  [SubmissionGroupType.ReviewRpAndSiteContact]: FormSubmissionPath.REVIEW_ADDRESS_AND_SITE_CONTACT,
  [SubmissionGroupType.UploadSchemeLineDiagram]: FormSubmissionPath.UPLOAD_SCHEME_LINE_DIAGRAM,
  [SubmissionGroupType.UploadEnergyFlowDiagram]: FormSubmissionPath.UPLOAD_ENERGY_FLOW_DIAGRAM,
  [SubmissionGroupType.UploadAnnualHeatProfile]: FormSubmissionPath.UPLOAD_ANNUAL_HEAT_PROFILE,
  [SubmissionGroupType.UploadDailyHeatProfile]: FormSubmissionPath.UPLOAD_DAILY_HEAT_PROFILE,
  [SubmissionGroupType.UploadHeatLoadDurationCurve]: FormSubmissionPath.UPLOAD_HEAT_LOAD_DURATION_CURVE,
  [SubmissionGroupType.AddPrimeMoverDetails]: FormSubmissionPath.ADD_PRIME_MOVER,
  [SubmissionGroupType.AddMeterDetails]: FormSubmissionPath.ADD_METER,
  [SubmissionGroupType.AddHeatRejectionFacilityDetails]: FormSubmissionPath.HEAT_REJECTION_FACILITY,
  [SubmissionGroupType.ChpTotalPowerCapacity]: '',
  [SubmissionGroupType.ChpMaxHeat]: '',
  [SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions]: FormSubmissionPath.SET_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS,
  // [SubmissionGroupType.ProvideHeatOutputs]: 'heat-rejection-facility',
  [SubmissionGroupType.ProvideHoursOfOperation]: FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION,
  [SubmissionGroupType.ProvideEnergyInputs]: FormSubmissionPath.PROVIDE_ENERGY_INPUTS,
  [SubmissionGroupType.ProvideHeatOutputs]: FormSubmissionPath.PROVIDE_HEAT_OUTPUTS,
  [SubmissionGroupType.ProvidePowerOutputs]: FormSubmissionPath.PROVIDE_POWER_OUTPUTS,
  [SubmissionGroupType.ProvideUncertaintyFactors]: 'provide-uncertainty-factors', //TODO: change this when respective entry in FormSubmissionPath has been created
  [SubmissionGroupType.ProvideCondensingStreamTurbineDetails]: FormSubmissionPath.CONDESING_STEAM_TURBINE,
  [SubmissionGroupType.QualityIndexThreshold]: FormSubmissionPath.QUALITY_INDEX_THRESHOLD,
  [SubmissionGroupType.PowerEfficiencyStatus]: FormSubmissionPath.POWER_EFFICIENCY_THRESHOLD,
  [SubmissionGroupType.QualityIndexStatus]: FormSubmissionPath.QUALITY_INDEX_STATUS,
  [SubmissionGroupType.RocQualityIndexStatus]: FormSubmissionPath.ROC_QUALITY_INDEX_STATUS,
  [SubmissionGroupType.SecretaryOfStateExemptionCertificate]: FormSubmissionPath.REQUEST_SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE,
  [SubmissionGroupType.RenewablesObligationCertificate]: FormSubmissionPath.REQUEST_ROC_CERTIFICATE,
  [SubmissionGroupType.ProvideInformationFinancialBenefits]: FormSubmissionPath.FINANCIAL_BENEFITS,
  [SubmissionGroupType.ContractsForDifferenceCertificate]: FormSubmissionPath.REQUEST_CFD_CERTIFICATE,
  [SubmissionGroupType.CfdQualityIndexStatus]: FormSubmissionPath.CFD_QUALITY_INDEX_STATUS,
  [SubmissionGroupType.SubmitToAssessor]: FormSubmissionPath.SUBMIT_FORM,

  [SubmissionGroupType.ProvideAuditRecommendation]: ASSESSOR_ROUTE_PATHS.auditRecommendation.isForAudit,
  [SubmissionGroupType.SubmitAssessment]: ASSESSOR_ROUTE_PATHS.submitAssessment.commentsToSecondAssessor,
  [SubmissionGroupType.ProvideAssessmentDecision]: ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.readyForCertification,
  [SubmissionGroupType.ReviewAssessorComments]: ASSESSOR_ROUTE_PATHS.assessorComments,

  [SubmissionGroupType.AssignSchemeForAssessment]: '#',
  [SubmissionGroupType.ReturnSchemeToRpFromAA]: ASSESSOR_ROUTE_PATHS.returnToRP.reasonForReturningScheme,
  [SubmissionGroupType.SetPoliciesAndThermalEfficiency]: '#',
};
