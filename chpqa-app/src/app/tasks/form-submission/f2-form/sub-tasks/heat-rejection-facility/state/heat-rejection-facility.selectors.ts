import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HeatRejectionFacilityState } from './heat-rejection-facility.reducer';

const selectHeatRejectionFacilityState = createFeatureSelector<HeatRejectionFacilityState>('heatRejectionFacility');

const selectApiUpdateHeatRejectionFacilityPost = createSelector(
  selectHeatRejectionFacilityState,
  (state: HeatRejectionFacilityState) => state.apiUpdateHeatRejectionFacilityPost
);
export const HeatRejectionFacilitySelectors = {
  selectHeatRejectionFacilityState,
  selectApiUpdateHeatRejectionFacilityPost,
};
