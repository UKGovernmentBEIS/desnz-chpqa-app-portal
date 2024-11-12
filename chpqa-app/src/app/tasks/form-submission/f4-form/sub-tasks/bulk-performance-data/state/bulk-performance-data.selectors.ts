import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BulkPerformanceDataState } from './bulk-performance-data.reducer';

const selectBulkPerformanceDataState = createFeatureSelector<BulkPerformanceDataState>('bulkPerformanceData');

const selectApiValidateFilePost = createSelector(
  selectBulkPerformanceDataState,
  (state: BulkPerformanceDataState) => state.apiValidateFilePost
);

const selectPerformanceDataFile = createSelector(
  selectBulkPerformanceDataState,
  (state: BulkPerformanceDataState) => state?.performanceDataFile
);

const selectApiUploadFilePost = createSelector(
  selectBulkPerformanceDataState,
  (state: BulkPerformanceDataState) => state.apiUploadFilesPost
);

export const BulkPerformanceDataSelectors = {
  selectApiValidateFilePost,
  selectPerformanceDataFile,
  selectApiUploadFilePost
};
