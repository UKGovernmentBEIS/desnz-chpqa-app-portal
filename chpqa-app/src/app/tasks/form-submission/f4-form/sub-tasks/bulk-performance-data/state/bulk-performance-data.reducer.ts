import { createReducer, on, Action } from '@ngrx/store';
import { notAsked, inProgress, success, failure, RemoteData } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';
import { BulkPerformanceDataActions } from './bulk-performance-data.actions';
import * as SharedActions from '@shared/store/shared.action';

export interface BulkPerformanceDataState {
  apiValidateFilePost: RemoteData<any, HttpErrorResponse>;
  performanceDataFile: File;
  apiUploadFilesPost: RemoteData<any, HttpErrorResponse>;
}

export const initialState: BulkPerformanceDataState = {
  apiValidateFilePost: notAsked(),
  performanceDataFile: null,
  apiUploadFilesPost: notAsked(),
};

export const bulkPerformanceDataReducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(BulkPerformanceDataActions.submitBulkPerformanceDataFileValidate, state => ({
    ...state,
    apiValidateFilePost: inProgress() as any,
  })),
  on(BulkPerformanceDataActions.submitBulkPerformanceDataFileValidateSuccess, (state, { response, performanceDataFile }) => ({
    ...state,
    apiValidateFilePost: success(response) as any,
  })),
  on(BulkPerformanceDataActions.submitBulkPerformanceDataFileValidateFailure, (state, { error }) => ({
    ...state,
    apiValidateFilePost: failure(error) as any,
  })),
  on(BulkPerformanceDataActions.setPerformanceDataFile, (state, { performanceDataFile }) => ({
    ...initialState,
    performanceDataFile,
  })),
  on(BulkPerformanceDataActions.submitBulkPerformanceDataUpload, state => ({
    ...state,
    apiUploadFilesPost: inProgress() as any,
  })),
  on(BulkPerformanceDataActions.submitBulkPerformanceDataUploadSuccess, (state, { response }) => ({
    ...state,
    apiUploadFilesPost: success(response) as any,
  })),
  on(BulkPerformanceDataActions.submitBulkPerformanceDataUploadFailure, (state, { error }) => ({
    ...state,
    apiUploadFilesPost: failure(error) as any,
  }))
);

export function reducer(state: BulkPerformanceDataState | undefined, action: Action) {
  return bulkPerformanceDataReducer(state, action);
}
