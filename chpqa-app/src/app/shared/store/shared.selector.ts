import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './shared.reducer';
import { SubmissionStatus } from '@shared/enums/status.enum';

const selectShared = createFeatureSelector<State>('shared');

export const selectSelectedScheme = createSelector(
  selectShared,
  state => state.scheme
);

export const selectBrowserCookiesEnabled = createSelector(
  selectShared,
  state => state.browserCookiesEnabled
);

export const selectCookiesSettings = createSelector(
  selectShared,
  state => state.acceptAnalyticsCookies
);

export const selectSubmissionFormId = createSelector(
  selectShared,
  state => state.submissionFormId
);

export const selectSchemeId = createSelector(
  selectShared,
  state => state.schemeId
);

// Selector to retrieve the entire forms object
export const selectForms = createSelector(
  selectShared,
  (state: State) => state.forms
);

// Selector to retrieve a specific form's state by name
export const selectFormState = (formName: string) => createSelector(
  selectForms,
  (forms) => forms ? forms[formName] : null
);

export const selectLatestSubmissionStatus = createSelector(
  selectSelectedScheme,
  scheme => scheme?.latestSubmissionStatus
);

export const selectIsSubmissionNonEditable = createSelector(
  selectSelectedScheme,
  scheme => scheme?.latestSubmissionStatus > SubmissionStatus.DueForRenewal
);

export const selectIsUserAnAssessor = createSelector(
  selectShared,
  (state: State) => state.isUserAnAssessor
);
export const getUserRoleApiResponse = createSelector(
  selectShared,
  (state: State) => state.getUserRoleApiResponse
);

export const selectApiDownloadFile = createSelector(
  selectShared,
  (state: State) => state.apiDownloadFile
);
