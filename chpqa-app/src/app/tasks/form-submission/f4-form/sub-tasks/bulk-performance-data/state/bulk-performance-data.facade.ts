import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Observable, takeUntil } from 'rxjs';
import { BulkPerformanceDataSelectors } from './bulk-performance-data.selectors';

@Injectable()
export class BulkPerformanceDataFacade {
  selectPerformanceDataFile$ = this.store.select(BulkPerformanceDataSelectors.selectPerformanceDataFile);
  apiValidateFilePost$ = this.store.select(BulkPerformanceDataSelectors.selectApiValidateFilePost);
  apiUploadFilePost$ = this.store.select(BulkPerformanceDataSelectors.selectApiUploadFilePost);

  constructor(
    private store: Store<any>,
    private spinner: NgxSpinnerService
  ) {}

  showLoadingSpinnerForApiResponses<T>(observables: Observable<RemoteData<T, HttpErrorResponse>>[], unsubscribe$: Observable<void>): void {
    combineLatest(observables)
      .pipe(takeUntil(unsubscribe$))
      .subscribe(responses => {
        if (responses.some(response => isInProgress(response))) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });
  }
}
