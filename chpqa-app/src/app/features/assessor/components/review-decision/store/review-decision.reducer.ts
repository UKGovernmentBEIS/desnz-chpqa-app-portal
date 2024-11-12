import { createReducer, on, Action } from '@ngrx/store';
import { ReplySubmGroupDetails } from 'src/app/api-services/chpqa-api/generated';
import { notAsked, inProgress, success, failure, RemoteData } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';
import { ReviewDecisionActions } from './review-decision.actions';

export interface ReviewDecisionState {
  apiGetAssessorsAssessmentGet: RemoteData<ReplySubmGroupDetails, HttpErrorResponse>;
}

export const initialState: ReviewDecisionState = {
  apiGetAssessorsAssessmentGet: notAsked(),
};

export const reviewDecisionReducer = createReducer(
  initialState,
  on(ReviewDecisionActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(ReviewDecisionActions.loadReviewDecision, state => ({
    ...state,
    apiGetAssessorsAssessmentGet: inProgress() as any
  })),
  on(ReviewDecisionActions.reviewDecisionLoaded, (state, { response }) => ({
    ...state,
    apiGetAssessorsAssessmentGet: success(response) as any
  })),
  on(ReviewDecisionActions.reviewDecisionError, (state, { error }) => ({
    ...state,
    apiGetAssessorsAssessmentGet: failure(error) as any
  })),
);

export function reducer(state: ReviewDecisionState | undefined, action: Action) {
  return reviewDecisionReducer(state, action);
}
