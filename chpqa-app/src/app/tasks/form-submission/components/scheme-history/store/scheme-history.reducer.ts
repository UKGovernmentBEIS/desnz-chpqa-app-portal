import { HttpErrorResponse } from '@angular/common/http';
import { Action, createReducer, on } from '@ngrx/store';
import { failure, inProgress, notAsked, RemoteData, success } from 'ngx-remotedata';
import { SchemeHistoryActions } from './scheme-history.actions';
import { ReplySubmissionHistory } from 'src/app/api-services/chpqa-api/generated';

export interface SchemeHistoryState {
  schemeHistory: RemoteData<ReplySubmissionHistory[], HttpErrorResponse>;
}

export const initialState: SchemeHistoryState = {
  schemeHistory: notAsked(),
};

export const schemeHistoryReducer = createReducer(
  initialState,
  on(SchemeHistoryActions.loadSchemeHistoryData, state => ({
    ...state,
    schemeHistory:  inProgress() as any,
  })),

  on(SchemeHistoryActions.loadSchemeHistoryDataSuccess, (state, { payload }) => ({
    ...state,
    schemeHistory: success(payload) as any,
  })),

  on(SchemeHistoryActions.loadSchemeHistoryDataFailure, (state, { error }) => ({
    ...state,
    schemeHistory: failure(error) as any,
  }))
);

export function reducer(state: SchemeHistoryState | undefined, action: Action) {
  return schemeHistoryReducer(state, action);
}
