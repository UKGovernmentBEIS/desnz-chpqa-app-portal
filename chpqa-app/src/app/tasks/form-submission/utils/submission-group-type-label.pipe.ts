import { Pipe, PipeTransform } from '@angular/core';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';

@Pipe({
  name: 'submissionGroupTypeLabel',
  standalone: true,
})
export class SubmissionGroupTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case SubmissionGroupType.ReviewRpAndSiteContact:
        return 'Confirm RP and site contact';
      case SubmissionGroupType.UploadSchemeLineDiagram:
        return 'Upload scheme line diagram';
      case SubmissionGroupType.UploadEnergyFlowDiagram:
        return 'Upload energy flow diagram';
      case SubmissionGroupType.UploadAnnualHeatProfile:
        return 'Upload annual heat profile';
      case SubmissionGroupType.UploadDailyHeatProfile:
        return 'Upload daily heat profile';
      case SubmissionGroupType.UploadHeatLoadDurationCurve:
        return 'Upload heat load duration curve';
      case SubmissionGroupType.AddPrimeMoverDetails:
        return 'Add prime mover details';
      case SubmissionGroupType.AddMeterDetails:
        return 'Add meter details';
      case SubmissionGroupType.AddHeatRejectionFacilityDetails:
        return 'Add heat rejection facility details';
      case SubmissionGroupType.ChpTotalPowerCapacity:
        return 'CHP total power capacity';
      case SubmissionGroupType.ChpMaxHeat:
        return 'CHP MaxHeat';
      case SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions:
        return 'Provide total power capacity under MaxHeat conditions';
      case SubmissionGroupType.ProvideHoursOfOperation:
        return 'Provide hours of operation';
      case SubmissionGroupType.ProvideEnergyInputs:
        return 'Provide energy inputs';
      case SubmissionGroupType.ProvidePowerOutputs:
        return 'Provide power outputs';
      case SubmissionGroupType.ProvideHeatOutputs:
        return 'Provide heat outputs';
      case SubmissionGroupType.ProvideUncertaintyFactors:
        return 'Provide uncertainty factors';
      case SubmissionGroupType.ProvideCondensingStreamTurbineDetails:
        return 'Provide condensing steam turbine details';
      case SubmissionGroupType.QualityIndexThreshold:
        return 'Select quality index threshold';
      case SubmissionGroupType.PowerEfficiencyStatus:
        return 'Power efficiency status';
      case SubmissionGroupType.QualityIndexStatus:
        return 'Quality index status';
      case SubmissionGroupType.RocQualityIndexStatus:
        return 'ROC quality index status';
      case SubmissionGroupType.SecretaryOfStateExemptionCertificate:
        return 'Secretary of State exemption certificate';
      case SubmissionGroupType.RenewablesObligationCertificate:
        return 'Renewables Obligation certificate';
      case SubmissionGroupType.ProvideInformationFinancialBenefits:
        return 'Provide information about your financial benefits (optional)';
      case SubmissionGroupType.ContractsForDifferenceCertificate:
        return 'Contracts For Difference Certificate';
      case SubmissionGroupType.CfdQualityIndexStatus:
        return 'Cfd quality index status';
      case SubmissionGroupType.SubmitToAssessor:
        return 'Submit to assessor';

      case SubmissionGroupType.ProvideAuditRecommendation:
        return 'Audit recommendation';
      case SubmissionGroupType.ProvideAssessmentDecision:
        return 'Provide assessment decision';
      default:
        return value + 'lal';
    }
  }
}
