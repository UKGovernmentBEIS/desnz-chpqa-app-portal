import { createAction, props } from '@ngrx/store';


const submitBulkPerformanceDataFileValidate = createAction(
  '[UploadPerformanceDataComponent] Validate Performance Data File'
);

const submitBulkPerformanceDataFileValidateSuccess = createAction(
  '[UploadPerformanceDataComponent] ValidatePerformance Data File Success',
  props<{ response: any, performanceDataFile: File }>()
);

const submitBulkPerformanceDataFileValidateFailure = createAction(
  '[UploadPerformanceDataComponent] Validate Performance Data File Fail',
  props<{ error: Error }>()
);

const setPerformanceDataFile = createAction(
  '[UploadPerformanceDataComponent] Set Performance Data File',
  props<{ performanceDataFile: File }>()
);

const submitBulkPerformanceDataUpload = createAction(
  '[UploadPerformanceDataSummaryComponent] Submit Bulk Performance Data'
);

const submitBulkPerformanceDataUploadSuccess = createAction(
  '[UploadPerformanceDataSummaryComponent] Submit Bulk Performance Data Success',
  props<{ response: any }>()
);

const submitBulkPerformanceDataUploadFailure = createAction(
  '[UploadPerformanceDataSummaryComponent] Submit Bulk Performance Data Failure',
  props<{ error: Error }>()
);


export const BulkPerformanceDataActions = {
  submitBulkPerformanceDataFileValidate,
  submitBulkPerformanceDataFileValidateSuccess,
  submitBulkPerformanceDataFileValidateFailure,
  setPerformanceDataFile,
  submitBulkPerformanceDataUpload,
  submitBulkPerformanceDataUploadSuccess,
  submitBulkPerformanceDataUploadFailure
};
