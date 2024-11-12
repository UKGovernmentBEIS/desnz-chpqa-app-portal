import { createAction, props } from '@ngrx/store';
import { ReplySubmGroupDetails } from 'src/app/api-services/chpqa-api/generated';

const resetToInitialState = createAction(
    '[Review Decision Form] Reset to initial state'
);

const loadReviewDecision = createAction(
    '[Review Decision Form] Load Review Decision Data'
);

const reviewDecisionLoaded = createAction(
    '[Review Decision Form] Review Decision Data Loaded',
    props<{ response: ReplySubmGroupDetails }>()
);

const reviewDecisionError = createAction(
    '[Review Decision Form] Error',
    props<{ error: any }>()
);

export const ReviewDecisionActions = {
    resetToInitialState,
    loadReviewDecision,
    reviewDecisionLoaded,
    reviewDecisionError
};