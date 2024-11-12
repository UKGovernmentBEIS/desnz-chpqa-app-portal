import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import * as SharedActions from '@shared/store/shared.action';
import { BulkPerformanceDataActions } from './bulk-performance-data.actions';

@Injectable()
export class BulkPerformanceDataEffects {
  submitBulkPerformanceDataFileValidateSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BulkPerformanceDataActions.submitBulkPerformanceDataFileValidateSuccess),
      map(action =>
        BulkPerformanceDataActions.setPerformanceDataFile({
          performanceDataFile: action.performanceDataFile,
        })
      )
    );
  });

  setPerformanceDataFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BulkPerformanceDataActions.setPerformanceDataFile),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.UPLOAD_PERFORMANCE_DATA_SUMMARY}`,
        })
      )
    );
  });

  submitBulkPerformanceDataUpload$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BulkPerformanceDataActions.submitBulkPerformanceDataUpload),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.UPLOAD_PERFORMANCE_DATA_SUBMIT_PROGRESS}`,
        })
      )
    );
  });

  submitBulkPerformanceDataUploadFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BulkPerformanceDataActions.submitBulkPerformanceDataUploadFailure),
        tap(({ error }) => {
          console.error('Failed to submit bulk performance data', error);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<any>
  ) {}
}
