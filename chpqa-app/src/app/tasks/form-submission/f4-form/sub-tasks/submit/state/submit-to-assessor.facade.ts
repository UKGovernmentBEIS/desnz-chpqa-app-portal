import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Observable, takeUntil } from 'rxjs';
import { UpdSubmtoAssessorClass } from 'src/app/api-services/chpqa-api/generated';
import { SubmitToAssessorSelectors } from './submit-to-assessor.selectors';
import { selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { SubmitToAssessorActions } from './submit-to-assessor.actions';

@Injectable()
export class SubmitToAssessorFacade {

  apiUpdateSubmitToAssessorPost$: Observable<RemoteData<UpdSubmtoAssessorClass, HttpErrorResponse>> = this.store.pipe(
    select(SubmitToAssessorSelectors.selectApiUpdateSubmitToAssessorPost)
  );
  submitToAssessorSectionStatus$: Observable<Status> = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.SubmitToAssessor)));

  constructor(
    private store: Store<any>,
    private spinner: NgxSpinnerService
  ) {}

  submitToAssessor(payload: UpdSubmtoAssessorClass): void {
    this.store.dispatch(SubmitToAssessorActions.submitToAssessor({ payload }));
  }


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

  setSubmitToAssessorSectionSuccess(): void {
    this.store.dispatch(SubmitToAssessorActions.submitToAssessorSuccess(null));
  }
}
