import { createReducer, on, Action } from '@ngrx/store';
import { SubmitToAssessorActions } from './submit-to-assessor.actions';
import { UpdSubmtoAssessorClass } from 'src/app/api-services/chpqa-api/generated';
import { notAsked, inProgress, success, failure, RemoteData, isSuccess } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';

export interface SubmitToAssessorState {
  apiUpdateSubmitToAssessorPost: RemoteData<UpdSubmtoAssessorClass, HttpErrorResponse>;
}

export const initialState: SubmitToAssessorState = {
  apiUpdateSubmitToAssessorPost: notAsked()
};

export const submitToAssessorReducer = createReducer(
  initialState,
  on(SubmitToAssessorActions.submitToAssessor, state => ({
    ...state,
    apiUpdateSubmitToAssessorPost: inProgress() as any
  })),
  on(SubmitToAssessorActions.submitToAssessorSuccess, (state, { response }) => ({
    ...state,
    apiUpdateSubmitToAssessorPost: success(response) as any
  })),
  on(SubmitToAssessorActions.submitToAssessorFailure, (state, { error }) => ({
    ...state,
    apiUpdateSubmitToAssessorPost: failure(error) as any
  })),
);

export function reducer(state: SubmitToAssessorState | undefined, action: Action) {
  return submitToAssessorReducer(state, action);
}
