// uncertainty-factors.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubmitToAssessorState } from './submit-to-assessor.reducer';

export const SubmitToAssessorFeatureKey = 'submitToAssessor';

const selectSubmitToAssessorState = createFeatureSelector<SubmitToAssessorState>(SubmitToAssessorFeatureKey);

const selectApiUpdateSubmitToAssessorPost = createSelector(
  selectSubmitToAssessorState,
  (state: SubmitToAssessorState) => state.apiUpdateSubmitToAssessorPost
);

export const SubmitToAssessorSelectors = {
  selectSubmitToAssessorState,
  selectApiUpdateSubmitToAssessorPost
};
