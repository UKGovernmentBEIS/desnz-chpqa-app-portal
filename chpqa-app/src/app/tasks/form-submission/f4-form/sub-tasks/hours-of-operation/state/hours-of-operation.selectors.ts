import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectSubmission = createFeatureSelector<any>('formSubmissionFeature');

export const selectSubmissionForm = createSelector(selectSubmission, state => state?.formSubmission);

export const selectHoursOfOperation = createSelector(selectSubmissionForm, state => ({
  hoursOfOperation: state?.hoursOfOperation ?? null,
}));
