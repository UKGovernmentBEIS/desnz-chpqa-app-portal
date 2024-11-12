import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ReviewDecisionState } from "./review-decision.reducer";

export const selectReviewDecisionState = createFeatureSelector<ReviewDecisionState>('reviewDecision');

const selectApiGetAssessorsAssessmentGet = createSelector(
    selectReviewDecisionState,
    (state: ReviewDecisionState) => state.apiGetAssessorsAssessmentGet
);

export const ReviewDcisionSelectors = {
    selectApiGetAssessorsAssessmentGet,
};