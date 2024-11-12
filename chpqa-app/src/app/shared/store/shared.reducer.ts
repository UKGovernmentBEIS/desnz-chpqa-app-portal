import { HttpErrorResponse } from '@angular/common/http';
import { createReducer, on } from '@ngrx/store';
import { failure, inProgress, notAsked, RemoteData, success } from 'ngx-remotedata';
import { Observable } from 'rxjs';
import { SchemeRegistration } from 'src/app/tasks/scheme-registration/models/scheme-registration.model';
import * as SharedActions from './shared.action';
import { ReplyPerson, ReplyScheme } from 'src/app/api-services/chpqa-api/generated';

export const sharedFeatureKey = 'shared';

export interface State {
  acceptCookies: boolean;
  browserCookiesEnabled: boolean;
  acceptAnalyticsCookies: boolean;
  schemeId: string;
  submissionFormId: string;
  scheme: ReplyScheme;
  forms?: { [formName: string]: any };
  isUserAnAssessor: boolean;
  submitAssessorReviewScreenDecisionApiResponse: Observable<RemoteData<any, HttpErrorResponse>>;
  getUserRoleApiResponse: Observable<RemoteData<ReplyPerson,HttpErrorResponse>>;
  apiDownloadFile: RemoteData<Blob, HttpErrorResponse>;
}

const initialState: State = {
  acceptCookies: null,
  browserCookiesEnabled: false,
  acceptAnalyticsCookies: null,
  schemeId: null,
  submissionFormId: null,
  scheme: null,
  forms: {},
  isUserAnAssessor: false,
  submitAssessorReviewScreenDecisionApiResponse: notAsked() as any,
  getUserRoleApiResponse: notAsked() as any,
  apiDownloadFile: notAsked(),
};

export const reducer = createReducer(
  initialState,
  on(SharedActions.setScheme, (state, { scheme: scheme }) => {
    return {
      ...state,
      scheme: { ...scheme },
    };
  }),
  on(SharedActions.setInitialSchemeState, (state, action) => {
    return {
      ...state,
      scheme: null,
    };
  }),
  on(SharedActions.saveCookieSettings, (state, action) => {
    return {
      ...state,
      acceptAnalyticsCookies: action.acceptAnalyticsCookies,
    };
  }),
  on(SharedActions.setSubmissionFormId, (state, { submissionFormId: submissionFormId }) => {
    return {
      ...state,
      submissionFormId: submissionFormId,
    };
  }),
  on(SharedActions.setSchemeId, (state, { schemeId: schemeId }) => {
    return {
      ...state,
      schemeId: schemeId,
    };
  }),
  on(SharedActions.updateFormState, (state, { formName, formData }) => {
    return {
      ...state,
      forms: {
        ...state.forms,
        [formName]: {
          ...state.forms[formName],
          ...formData,
        },
      },
    };
  }),
  on(SharedActions.resetFormState, (state, { formName }) => {
    const { [formName]: removedForm, ...newForms } = state.forms;
    return {
      ...state,
      forms: newForms,
    };
  }),
  on(SharedActions.resetAllForms, state => ({
    ...state,
    forms: {},
  })),
  on(SharedActions.setIsUserAnAssessorFlag, (state, action) => ({
    ...state,
    isUserAnAssessor: action.isUserAnAssessor,
  })),
  // Handling Assessor Review Screen Decision
  on(SharedActions.assessorReviewScreenDecisionInProgress, state => ({
    ...state,
    submitAssessorReviewScreenDecisionApiResponse: inProgress() as any,
  })),
  on(SharedActions.assessorReviewScreenDecisionSuccess, (state, { formValue }) => ({
    ...state,
    submitAssessorReviewScreenDecisionApiResponse: success(formValue) as any,
  })),
  on(SharedActions.assessorReviewScreenDecisionFailure, (state, { error }) => ({
    ...state,
    submitAssessorReviewScreenDecisionApiResponse: failure(error) as any,
  })),
  // Handling Get User Role
  on(SharedActions.getUserRole, state => ({
    ...state,
    getUserRoleApiResponse: inProgress() as any,
  })),
  on(SharedActions.getUserRoleSuccess, (state, { payload }) => ({
    ...state,
    getUserRoleApiResponse: success(payload) as any,
  })),
  on(SharedActions.getUserRoleFailure, (state, { error }) => ({
    ...state,
    getUserRoleApiResponse: failure(error) as any,
  })),
  // Handling File Download
  on(SharedActions.downloadFile, state => ({
    ...state,
    apiDownloadFile: inProgress() as any
  })),
  on(SharedActions.downloadFileSuccess, (state, { response }) => ({
    ...state,
    apiDownloadFile: success(response) as any
  })),
  on(SharedActions.downloadFileFailure, (state, { error }) => ({
    ...state,
    apiDownloadFile: failure(error) as any
  })),
);
