import { Action, createReducer, on } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { notAsked, inProgress, success, failure, RemoteData } from 'ngx-remotedata';
import { DashboardActions } from './dashboard.actions';
import { DashboardScheme } from '../models/dashboard-scheme.model';

export interface DashboardState {
  dashboardDataApiResponse: RemoteData<DashboardScheme[], HttpErrorResponse>;
}

// Initial state for each page using RemoteData
const initialState: DashboardState = {
  dashboardDataApiResponse: notAsked(),
};

export const dashboardReducer = createReducer(
  initialState,

  on(DashboardActions.loadData, state => ({
    ...state,
    dashboardDataApiResponse: inProgress() as any 
  })),

  on(DashboardActions.loadDataSuccess, (state, { payload }) => ({
    ...state,
    dashboardDataApiResponse: success(payload) as any
  })),

  on(DashboardActions.loadDataFailure, (state, { error }) => ({
    ...state,
    dashboardDataApiResponse: failure(error) as any
  })),

);

//////////////////////////////////////////////////////
//               Final Reducer Export               //
//////////////////////////////////////////////////////

export function reducer(state: DashboardState | undefined, action: Action) {
  return dashboardReducer(state, action);
}
