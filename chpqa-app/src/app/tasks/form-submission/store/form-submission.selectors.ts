import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubmissionFormType, SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { selectIsUserAnAssessor } from '@shared/store';
import { ReplySubmissionGroups } from 'src/app/api-services/chpqa-api/generated';

export const selectSubmission = createFeatureSelector<any>('formSubmissionFeature');

export const selectSubmissionForm = createSelector(selectSubmission, state => state?.formSubmission);

export const selectSubmissionGroupId = createSelector(selectSubmission, state => state?.submissionGroup?.id);

export const selectSubmissionGroup = createSelector(
  selectSubmission,
  state => state?.submissionGroup
);

export const selectFormSubmissionType = createSelector(selectSubmissionForm, formSubmission => formSubmission?.submissionFormType);

export const isComplex = createSelector(
  selectSubmissionForm,
  formSubmission => formSubmission?.submissionFormType === SubmissionFormType.F4 || formSubmission?.submissionFormType === SubmissionFormType.F3
);

export const selectQualifyingHeatOutput = createSelector(selectSubmission, state => state?.qualifyingHeatOutput);

export const selectTotalHeatExported = createSelector(selectSubmission, state => state?.totalHeatExported);

export const selectSubmitToAssessorGroupId = createSelector(selectSubmission, state => state?.submitToAssessorGroupId);

export const selectFinancialBenefits = createSelector(selectSubmissionForm, state => ({
  annualClimateChangeLevyAmount: state?.annualClimateChangeLevyAmount,
  annualCarbonPriceSupportAmount: state?.annualCarbonPriceSupportAmount,
  annualRenewableHeatIncentiveUpliftAmount: state?.annualRenewableHeatIncentiveUpliftAmount,
  annualRenewablesObligationCertificateAmount: state?.annualRenewablesObligationCertificateAmount,
  annualContractsForDifferenceAmount: state?.annualContractsForDifferenceAmount,
  annualBusinessRatesReductionAmount: state?.annualBusinessRatesReductionAmount,
}));

export const selectSectionId = (groupType: SubmissionGroupType) =>
  createSelector(selectSubmissionForm, state => {
    const section = state?.sectionStatusList.find((section: ReplySubmissionGroups) => section.groupType === groupType);
    return section ? section.id : null;
  });

export const selectSectionStatus = (groupType: SubmissionGroupType) =>
  createSelector(
    selectSubmissionForm,
    selectIsUserAnAssessor,
    (submissionForm, isUserAnAssessor) => {
    const section = submissionForm?.sectionStatusList.find((section: ReplySubmissionGroups) => {
      return section.groupType === groupType;
    });
    const statusProp = isUserAnAssessor ? 'assessorStatus' : 'status';
    return section && section[statusProp] !== undefined ? section[statusProp] : null;
  });

export const selectSectionById = (groupType: SubmissionGroupType) =>
  createSelector(selectSubmissionForm, state => {
    const section = state?.sectionStatusList.find((section: ReplySubmissionGroups) => section.groupType === groupType);
    return section ? section : null;
  });

export const selectTotalFuelEnergyBoilers = createSelector(selectSubmissionForm, formSubmission => formSubmission?.estimatedTotalFuelEnergyBoilers);

export const selectTotalFuelEnergyPrimeEngines = createSelector(selectSubmissionForm, formSubmission => formSubmission?.estimatedTotalFuelEnergyPrimeEngines);

export const selectTotalHeatOutputPrimeMovers = createSelector(
  selectSubmissionForm,
  formSubmission => formSubmission?.estimatedTotalHeatOutputUsedInthePrimeMovers
);

export const selectTotalHeatOutputBoilers = createSelector(selectSubmissionForm, formSubmission => formSubmission?.estimatedTotalHeatOutputUsedIntheBoilers);

export const selectUncertaintyFactors = createSelector(selectSubmissionForm, state => ({
  foi: state?.foi ?? null,
  fop: state?.fop ?? null,
  foh: state?.foh ?? null
}));

export const selectHeatRejectionFacility = createSelector(selectSubmissionForm, state => ({
  heatRejectionFacility: {
    label: state?.heatRejectionFacility !== null ? (state?.heatRejectionFacility ? 'Yes' : 'No') : null,
    value: state?.heatRejectionFacility !== null ? state?.heatRejectionFacility : null,
  },
}));

export const selectEnergyFlowDiagramComments = createSelector(selectSubmissionForm, state => ({
  energyFlowDiagramComments: state?.energyFlowDiagramComments !== null ? state?.energyFlowDiagramComments : null,
}));

export const selectSchemeLineDiagramComments = createSelector(selectSubmissionForm, state => ({
  schemeLineDiagramComments: state?.schemeLineDiagramComments !== null ? state?.schemeLineDiagramComments : null,
}));

export const selectAnnualHeatProfileComments = createSelector(selectSubmissionForm, state => ({
  annualHeatProfileComments: state?.annualHeatProfileComments !== null ? state?.annualHeatProfileComments : null,
}));

export const selectDailyHeatProfileComments = createSelector(selectSubmissionForm, state => ({
  dailyHeatProfileComments: state?.dailyHeatProfileComments !== null ? state?.dailyHeatProfileComments : null,
}));

export const selectHeatLoadDurationCurveComments = createSelector(selectSubmissionForm, state => ({
  heatLoadDurationCurveComments: state?.heatLoadDurationCurveComments !== null ? state?.heatLoadDurationCurveComments : null,
}));

export const selectRequestSoSCertificate = createSelector(selectSubmissionForm, state => ({
  sosCertificate: state?.sosCertificate !== null ? state?.sosCertificate : null,
}));

export const selectUncertaintyFactorsComments = createSelector(selectSubmissionForm, state => ({
  uncertaintyFactorsComments: state?.uncertaintyFactorComment !== null ? state?.uncertaintyFactorComment : null,
}));