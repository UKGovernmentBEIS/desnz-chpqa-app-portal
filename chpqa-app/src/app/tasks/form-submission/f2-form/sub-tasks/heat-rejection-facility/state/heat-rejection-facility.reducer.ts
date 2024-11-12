import { createReducer, on, Action } from '@ngrx/store';
import { HeatRejectionFacilityActions } from './heat-rejection-facility.actions';
import { notAsked, inProgress, success, failure, RemoteData } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';
import { UpdateHeatRejectionFacility } from 'src/app/api-services/chpqa-api/generated';
import * as SharedActions from '@shared/store/shared.action';

export interface HeatRejectionFacilityState {
  apiUpdateHeatRejectionFacilityPost: RemoteData<UpdateHeatRejectionFacility, HttpErrorResponse>;
}

export const initialState: HeatRejectionFacilityState = {
  apiUpdateHeatRejectionFacilityPost: notAsked(),
};

export const heatRejectionFacilityReducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(HeatRejectionFacilityActions.setHeatRejectionFacilityAsComplete, state => ({
    ...state,
    apiUpdateHeatRejectionFacilityPost: inProgress() as any,
  })),
  on(HeatRejectionFacilityActions.submitHeatRejectionFacilitySuccess, (state, { response }) => ({
    ...state,
    apiUpdateHeatRejectionFacilityPost: success(response) as any,
  })),
  on(HeatRejectionFacilityActions.submitHeatRejectionFacilityFailure, (state, { error }) => ({
    ...state,
    apiUpdateHeatRejectionFacilityPost: failure(error) as any,
  }))
);

export function reducer(state: HeatRejectionFacilityState | undefined, action: Action) {
  return heatRejectionFacilityReducer(state, action);
}
