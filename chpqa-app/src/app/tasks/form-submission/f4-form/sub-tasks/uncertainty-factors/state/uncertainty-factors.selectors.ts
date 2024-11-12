// uncertainty-factors.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UncertaintyFactorsState } from './uncertainty-factors.reducer';

const selectUncertaintyFactorsState = createFeatureSelector<UncertaintyFactorsState>('uncertaintyFactors');

const selectUncertaintyFactorsUploadedDocuments = createSelector(
  selectUncertaintyFactorsState,
  (state: UncertaintyFactorsState) => state.uncertaintyFactorsUploadedDocuments
);
const selectUncertaintyFactorsValues = createSelector(selectUncertaintyFactorsState, (state: UncertaintyFactorsState) => state.uncertaintyFactorsValues);

export const UncertaintyFactorsSelectors = {
  selectUncertaintyFactorsState,

  selectUncertaintyFactorsUploadedDocuments,
  selectUncertaintyFactorsValues,
};
