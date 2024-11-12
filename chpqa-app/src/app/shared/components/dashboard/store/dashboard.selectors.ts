import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.reducer';

// Select the assessor feature state from the global store
export const selectDashboardState = createFeatureSelector<DashboardState>('dashboardReducer');

// Select the entire dashboard response object (RemoteData)
const selectDashboardResponse = createSelector(
  selectDashboardState, (state: DashboardState) => state.dashboardDataApiResponse
);

export const DashboardSelectors = {
  selectDashboardResponse
};
