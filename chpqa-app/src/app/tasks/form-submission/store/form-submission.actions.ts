import { createAction, props } from '@ngrx/store';
import { Status } from '@shared/enums/status.enum';
import { FinancialBenefitsData, FormSubmission } from '@shared/models/form-submission.model';
import { CondensingSteamTurbine } from '../f4-form/models/f4-form.model';
import { ReplySubmission, ReplySubmissionGroups } from 'src/app/api-services/chpqa-api/generated';

export enum FormSubmissionsActionTypes {
  SET_SUBMISSION_FORM = '[Submission Form] Set Submission Form',
  SET_SUBMISSION_GROUP = '[Form Submission] Set Submission Group',
  SET_SUBMISSION_GROUPID_AND_NAVIGATE = '[Form Submission] Set Submission Group and Navigate',
  SET_QUALIFYING_HEAT_OUTPUT = '[Form Submission] Set Qualifying Heat Output',
  SET_TOTAL_HEAT_EXPORTED = '[Form Submission] Set Total Heat Exported',
  RESET_HEATS = '[Form Submission] Reset Heats',
  SET_FINANCIAL_BENEFITS = '[F4 Form] Set Financial Benefits',
  SUBMIT_FINANCIAL_BENEFITS = '[F4 Form] Submit Financial Benefits',
  SUBMIT_FINANCIAL_BENEFITS_SUCCESS = '[F4 Form] Submit Financial Benefits Success',
  SUBMIT_FINANCIAL_BENEFITS_FAIL = '[F4 Form] Submit Financial Benefits Fail',
  SET_SUBMIT_TO_ASSESSOR_GROUP_ID = '[Form Submission] Set submit to assessor group id',
  UPDATE_SUBMIT_TO_ASSESSOR_STATUS = '[Form Submission] Update Submit to Assessor status',
  UPDATE_SUBMIT_TO_ASSESSOR_STATUS_SUCCESS = '[Form Submission] Update Submit to Assessor status success',
  UPDATE_SUBMIT_TO_ASSESSOR_STATUS_FAILURE = '[Form Submission] Update Submit to Assessor status failure',
  FETCH_ENERGY_INPUTS = '[F4 Form] Fetch Energy Inputs',
  FETCH_POWER_OUTPUTS = '[F4 Form] Fetch Power Outputs',
  FETCH_HEAT_OUTPUTS = '[F4 Form] Fetch Heat Outputs',
  SET_TOTAL_FUEL_ENERGY_PRIME_ENGINES = '[F4 Form] Set Total Fuel Energy Prime Engines',
  SET_TOTAL_FUEL_ENERGY_BOILERS = '[F4 Form] Set Total Fuel Energy Boilers',
  SET_TOTAL_HEAT_OUTPUT_PRIME_MOVERS = '[F4 Form] Set Total Heat Output Prime Movers',
  SET_TOTAL_HEAT_OUTPUT_BOILERS = '[F4 Form] Set Total Heat Output Boilers',
  SET_CONDENSING_STEAM_TURBINE_FROM_FORM_SUBMISSION = '[F4 Form] Set Condensing Steam Turbine From Form Submission',

}

export const setSubmissionForm = createAction(
  FormSubmissionsActionTypes.SET_SUBMISSION_FORM,
  props<{ formSubmission: ReplySubmission }>()
);

export const setSubmissionGroup = createAction(
  FormSubmissionsActionTypes.SET_SUBMISSION_GROUP,
  props<{ submissionGroup: ReplySubmissionGroups }>()
);

export const setSubmissionGroupIdAndNavigate = createAction(
  FormSubmissionsActionTypes.SET_SUBMISSION_GROUPID_AND_NAVIGATE,
  props<{ id: string, groupType: any }>()
);

export const setQualifyingHeatOutput = createAction(
  FormSubmissionsActionTypes.SET_QUALIFYING_HEAT_OUTPUT,
  props<{ qualifyingHeatOutput: number }>()
);

export const setTotalHeatExported = createAction(
  FormSubmissionsActionTypes.SET_TOTAL_HEAT_EXPORTED,
  props<{ totalHeatExported: number }>()
);

export const resetHeats = createAction(FormSubmissionsActionTypes.RESET_HEATS);

export const setFinancialBenefits = createAction(
  FormSubmissionsActionTypes.SET_FINANCIAL_BENEFITS,
  props<{ financialBenefits: FinancialBenefitsData}>()
);

export const submitFinancialBenefits = createAction(
  FormSubmissionsActionTypes.SUBMIT_FINANCIAL_BENEFITS
);

export const submitFinancialBenefitsSuccess = createAction(
  FormSubmissionsActionTypes.SUBMIT_FINANCIAL_BENEFITS_SUCCESS
);

export const submitFinancialBenefitsFail = createAction(
  FormSubmissionsActionTypes.SUBMIT_FINANCIAL_BENEFITS_FAIL,
  props<{ error: any }>()
);

export const setSubmitToAssessorGroupId = createAction(
  FormSubmissionsActionTypes.SET_SUBMIT_TO_ASSESSOR_GROUP_ID,
  props<{ groupId: string }>()
);

export const updateSubmitToAssessorStatus = createAction(
  FormSubmissionsActionTypes.UPDATE_SUBMIT_TO_ASSESSOR_STATUS,
  props<{ newStatus: Status }>()
);

export const updateSubmitToAssessorStatusSuccess = createAction(
  FormSubmissionsActionTypes.UPDATE_SUBMIT_TO_ASSESSOR_STATUS_SUCCESS
);

export const updateSubmitToAssessorStatusFailure = createAction(
  FormSubmissionsActionTypes.UPDATE_SUBMIT_TO_ASSESSOR_STATUS_FAILURE,
  props<{ error: any }>()
);

export const fetchEnergyInputs = createAction(
  FormSubmissionsActionTypes.FETCH_ENERGY_INPUTS
);

export const fetchPowerOutputs = createAction(
  FormSubmissionsActionTypes.FETCH_POWER_OUTPUTS
);

export const fetchHeatOutputs = createAction(
  FormSubmissionsActionTypes.FETCH_HEAT_OUTPUTS
);

export const setTotalFuelEnergyPrimeEngines = createAction(
  FormSubmissionsActionTypes.SET_TOTAL_FUEL_ENERGY_PRIME_ENGINES,
  props<{ estimatedTotalFuelEnergyPrimeEngines: number; }>()
);

export const setTotalFuelEnergyBoilers = createAction(
  FormSubmissionsActionTypes.SET_TOTAL_FUEL_ENERGY_BOILERS,
  props<{ estimatedTotalFuelEnergyBoilers: number; }>()
);

export const setTotalHeatOutputPrimeMovers = createAction(
  FormSubmissionsActionTypes.SET_TOTAL_HEAT_OUTPUT_PRIME_MOVERS,
  props<{ estimatedTotalHeatOutputUsedInthePrimeMovers: number; }>()
);

export const setTotalHeatOutputBoilers= createAction(
  FormSubmissionsActionTypes.SET_TOTAL_HEAT_OUTPUT_BOILERS,
  props<{ estimatedTotalHeatOutputUsedIntheBoilers: number; }>()
);

export const setCondensingSteamTurbineFromFormSubmission = createAction(
  FormSubmissionsActionTypes.SET_CONDENSING_STEAM_TURBINE_FROM_FORM_SUBMISSION,
  props<{ condensingSteamTurbine: CondensingSteamTurbine }>()
);