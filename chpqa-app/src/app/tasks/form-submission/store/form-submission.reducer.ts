import { createReducer, on } from '@ngrx/store';
import * as FormSubmissionsActions from './form-submission.actions';
import { FormSubmission } from '@shared/models/form-submission.model';
import * as SharedActions from '@shared/store/shared.action';
import { ReplySubmission, ReplySubmissionGroups } from 'src/app/api-services/chpqa-api/generated';

export interface FormSubmissionState {
  formSubmission: ReplySubmission;
  submissionGroup: ReplySubmissionGroups;
  qualifyingHeatOutput: number;
  totalHeatExported: number;
  submitToAssessorGroupId: string;
}

export const initialState: FormSubmissionState = {
  formSubmission: null,
  submissionGroup: null,
  qualifyingHeatOutput: null,
  totalHeatExported: null,
  submitToAssessorGroupId: null,
};

export const formSubmissionFeatureKey = 'formSubmissionFeature';

export const reducer = createReducer(
  initialState,
  on(FormSubmissionsActions.setSubmissionForm, (state, { formSubmission }) => ({
    ...state,
    formSubmission,
  })),
  on(FormSubmissionsActions.setSubmissionGroup, (state, { submissionGroup }) => ({
    ...state,
    submissionGroup
  })),
  on(FormSubmissionsActions.setSubmissionGroupIdAndNavigate, (state, { id }) => ({
    ...state,
    submissionGroup: {
      ...state.submissionGroup,
      id: id
    }
  })),
  on(SharedActions.resetToInitialState, (state) => ({
    ...initialState,
  })),
  on(
    FormSubmissionsActions.setTotalFuelEnergyBoilers,
    (state, { estimatedTotalFuelEnergyBoilers }) => ({
      ...state,
      formSubmission: {
        ...state.formSubmission,
        estimatedTotalFuelEnergyBoilers: estimatedTotalFuelEnergyBoilers,
      },
    })
  ),
  on(
    FormSubmissionsActions.setTotalFuelEnergyPrimeEngines,
    (state, { estimatedTotalFuelEnergyPrimeEngines }) => ({
      ...state,
      formSubmission: {
        ...state.formSubmission,
        estimatedTotalFuelEnergyPrimeEngines:
          estimatedTotalFuelEnergyPrimeEngines,
      },
    })
  ),
  on(
    FormSubmissionsActions.setTotalHeatOutputPrimeMovers,
    (state, { estimatedTotalHeatOutputUsedInthePrimeMovers }) => ({
      ...state,
      formSubmission: {
        ...state.formSubmission,
        estimatedTotalHeatOutputUsedInthePrimeMovers: estimatedTotalHeatOutputUsedInthePrimeMovers,
      },
    })
  ),
  on(
    FormSubmissionsActions.setTotalHeatOutputBoilers,
    (state, { estimatedTotalHeatOutputUsedIntheBoilers }) => ({
      ...state,
      formSubmission: {
        ...state.formSubmission,
        estimatedTotalHeatOutputUsedIntheBoilers:
        estimatedTotalHeatOutputUsedIntheBoilers,
      },
    })
  ),
  on(
    FormSubmissionsActions.setQualifyingHeatOutput,
    (state, { qualifyingHeatOutput }) => ({
      ...state,
      qualifyingHeatOutput: qualifyingHeatOutput,
    })
  ),
  on(
    FormSubmissionsActions.setTotalHeatExported,
    (state, { totalHeatExported }) => ({
      ...state,
      totalHeatExported: totalHeatExported,
    })
  ),
  on(FormSubmissionsActions.resetHeats, state => ({
    ...state,
    qualifyingHeatOutput: initialState.qualifyingHeatOutput,
    totalHeatExported: initialState.totalHeatExported,
  })),
  on(
    FormSubmissionsActions.setFinancialBenefits,
    (state, { financialBenefits }) => ({
      ...state,
      formSubmission: {
        ...state.formSubmission,
        annualClimateChangeLevyAmount:
          financialBenefits?.annualClimateChangeLevyAmount,
        annualCarbonPriceSupportAmount:
          financialBenefits?.annualCarbonPriceSupportAmount,
        annualRenewableHeatIncentiveUpliftAmount:
          financialBenefits?.annualRenewableHeatIncentiveUpliftAmount,
        annualRenewablesObligationCertificateAmount:
          financialBenefits?.annualRenewablesObligationCertificateAmount,
        annualContractsForDifferenceAmount:
          financialBenefits?.annualContractsForDifferenceAmount,
        annualBusinessRatesReductionAmount:
          financialBenefits?.annualBusinessRatesReductionAmount,
      },
    })
  ),
  on(
    FormSubmissionsActions.setSubmitToAssessorGroupId,
    (state, { groupId }) => ({
      ...state,
      submitToAssessorGroupId: groupId,
    })
  )
);
