import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SchemeHistoryState } from './scheme-history.reducer';

export const SchemeHistoryFeatureKey = 'schemeHistory';

export const selectSchemeHistoryState = createFeatureSelector<SchemeHistoryState>(SchemeHistoryFeatureKey);
const selectSchemeHistoryResponse = createSelector(selectSchemeHistoryState, (state: SchemeHistoryState) => state.schemeHistory);

export const SchemeHistorySelectors = {
  selectSchemeHistoryResponse,
};
