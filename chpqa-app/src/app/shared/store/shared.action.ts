import { createAction, props } from '@ngrx/store';
import { AssessorReviewDecisionForm } from '@shared/models/assessor-review-decision-form.model';
import { ReplyScheme, RequestCreateManufactModelEngineUnit, RequestReturnManuModelEngineUnitId } from 'src/app/api-services/chpqa-api/generated';

export enum SharedActionTypes {
  SAVE_COOKIE_SETTINGS = '[Shared] Save cookie settings',
  SET_SCHEME = '[Shared] Set Scheme',
  SET_INITIAL_SCHEME_STATE = '[Shared] Set Initial Scheme State',
  NAVIGATE_TO = '[Shared] Navigate to',
  FETCH_ALL_UNITS = '[Unit] Fetch All Units',
  FETCH_ALL_UNITS_SUCCESS = '[Unit] Fetch All Units Success',
  FETCH_ALL_UNITS_FAILURE = '[Unit] Fetch All Units Failure',
  CREATE_UNIT = '[Unit] Create Unit',
  CREATE_UNIT_SUCCESS = '[Unit] Create Unit Success',
  CREATE_UNIT_FAILURE = '[Unit] Create Unit Failure',
  SET_SUBMISSION_FORM_ID = '[Shared] Set submission form id',
  SET_SCHEME_ID = '[Shared] Set scheme id',
  UPDATE_FORM_STATE = '[Shared] Update Form State',
  RESET_FORM_STATE = '[Shared] Reset Form State',
  RESET_ALL_FORMS_STATE = '[Shared] Reset All Forms State',
  RESET_TO_INITIAL_STATE = '[Shared] RESET_TO_INITIAL_STATE',
  SET_IS_USER_AN_ASSESSOR = '[Shared - App Component] SET FLAG IS USER AN ASSESSOR',
  ASSESSOR_REVIEW_SCREEN_DECISION_IN_PROGRESS = '[Assessor Review Screen Decision Status] Submission In Progress',
  ASSESSOR_REVIEW_SCREEN_DECISION_SUCCESS = '[Assessor Review Screen Decision Status] Submission Success',
  ASSESSOR_REVIEW_SCREEN_DECISION_FAILURE = '[Assessor Review Screen Decision Status] Submission Failure',
  GET_USER_ROLE = '[Shared - App Component] Get User Role',
  GET_USER_ROLE_SUCCESS = '[Shared - App Component] Get User Role Success',
  GET_USER_ROLE_FAILURE = '[Shared - App Component] Get User Role Failure',
  DOWNLOAD_FILE = '[Shared] Download File',
  DOWNLOAD_FILE_SUCCESS = '[Shared] Download File Success',
  DOWNLOAD_FILE_FAILURE = '[Shared] Download File Failure',
}

export const setIsUserAnAssessorFlag = createAction(SharedActionTypes.SET_IS_USER_AN_ASSESSOR, props<{ isUserAnAssessor: boolean }>());

export const saveCookieSettings = createAction(SharedActionTypes.SAVE_COOKIE_SETTINGS, props<{ acceptAnalyticsCookies: boolean; navigateTo?: string }>());

export const setScheme = createAction(SharedActionTypes.SET_SCHEME, props<{ scheme: ReplyScheme }>());

export const setInitialSchemeState = createAction(SharedActionTypes.SET_INITIAL_SCHEME_STATE);

export const navigateTo = createAction(SharedActionTypes.NAVIGATE_TO, props<{ url: string }>());

export const fetchAllUnits = createAction(SharedActionTypes.FETCH_ALL_UNITS);

export const fetchAllUnitsSuccess = createAction(SharedActionTypes.FETCH_ALL_UNITS_SUCCESS);

export const fetchAllUnitsFailure = createAction(SharedActionTypes.FETCH_ALL_UNITS_FAILURE, props<{ error: any }>());

export const createUnit = createAction(SharedActionTypes.CREATE_UNIT, props<{ createUnitRequest: RequestCreateManufactModelEngineUnit }>());

export const createUnitSuccess = createAction(SharedActionTypes.CREATE_UNIT_SUCCESS, props<{ createUnitResponse: RequestReturnManuModelEngineUnitId }>());

export const createUnitFailure = createAction(SharedActionTypes.CREATE_UNIT_FAILURE, props<{ error: any }>());

export const setSchemeId = createAction(SharedActionTypes.SET_SCHEME_ID, props<{ schemeId: string }>());

export const setSubmissionFormId = createAction(SharedActionTypes.SET_SUBMISSION_FORM_ID, props<{ submissionFormId: string }>());

export const updateFormState = createAction(SharedActionTypes.UPDATE_FORM_STATE, props<{ formName: string; formData: any }>());

export const resetFormState = createAction(SharedActionTypes.RESET_FORM_STATE, props<{ formName: string }>());

export const getUserRole = createAction(SharedActionTypes.GET_USER_ROLE);

export const getUserRoleSuccess = createAction(SharedActionTypes.GET_USER_ROLE_SUCCESS, props<{ payload: any }>());

export const getUserRoleFailure = createAction(SharedActionTypes.GET_USER_ROLE_FAILURE, props<{ error: any }>());

export const resetAllForms = createAction(SharedActionTypes.RESET_ALL_FORMS_STATE);

export const resetToInitialState = createAction(SharedActionTypes.RESET_TO_INITIAL_STATE);

export const assessorReviewScreenDecisionInProgress = createAction(SharedActionTypes.ASSESSOR_REVIEW_SCREEN_DECISION_IN_PROGRESS);

export const assessorReviewScreenDecisionSuccess = createAction(
  SharedActionTypes.ASSESSOR_REVIEW_SCREEN_DECISION_SUCCESS,
  props<{ formValue: AssessorReviewDecisionForm }>()
);

export const assessorReviewScreenDecisionFailure = createAction(SharedActionTypes.ASSESSOR_REVIEW_SCREEN_DECISION_FAILURE, props<{ error: any }>());

export const submitAssessorReviewScreenDecision = (context: string) =>
  createAction(buildDynamicAssessorReviewScreenSubmissionActionType(context), props<{ formValue: AssessorReviewDecisionForm }>());

export function buildDynamicAssessorReviewScreenSubmissionActionType(context: string): string {
  return `[Assessor Review Screen Decision] - ${context}`;
}

export const downloadFile = createAction(SharedActionTypes.DOWNLOAD_FILE, props<{ fileId: string, fileName: string }>());

export const downloadFileSuccess = createAction(SharedActionTypes.DOWNLOAD_FILE_SUCCESS, props<{ response: any }>());

export const downloadFileFailure = createAction(SharedActionTypes.DOWNLOAD_FILE_FAILURE, props<{ error: any }>());
