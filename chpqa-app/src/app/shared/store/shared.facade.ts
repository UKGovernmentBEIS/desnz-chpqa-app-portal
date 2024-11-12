import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectApiDownloadFile, selectIsSubmissionNonEditable, selectIsUserAnAssessor, selectLatestSubmissionStatus } from './shared.selector';
import { AssessorReviewDecisionForm } from '@shared/models/assessor-review-decision-form.model';
import { downloadFile, submitAssessorReviewScreenDecision } from './shared.action';
import { HttpErrorResponse } from '@angular/common/http';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { combineLatest, map, Observable, takeUntil } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { selectUser } from 'src/app/auth/auth.selector';
import { UserType } from '@shared/enums/user-type.enum';

@Injectable({ providedIn: 'root' })
export class SharedFacade {
  apiDownloadFile$: Observable<RemoteData<Blob, HttpErrorResponse>> = this.store.pipe(select(selectApiDownloadFile));
  selectLatestSubmissionStatus$: Observable<number> = this.store.select(selectLatestSubmissionStatus);

  constructor(
    private store: Store,
    private spinner: NgxSpinnerService
  ) {}

  isSubmissionNonEditable() {
    return this.store.select(selectIsSubmissionNonEditable);
  }

  isUserAnAssessor() {
    return this.store.select(selectIsUserAnAssessor);
  }

  isUserATechnicalAssessor2() {
    return this.store.pipe(
      select(selectUser),
      map(user => user.userType === UserType.TechnicalAssessor2)
    );
  }

  isUserATechnicalAssessor() {
    return this.store.pipe(
      select(selectUser),
      map(user => user?.userType === UserType.TechnicalAssessor ||  user?.userType === UserType.TechnicalAssessor2)
    );
  }


  isUserAnAssessorAdmin() {
    return this.store.pipe(
      select(selectUser),
      map(user => user?.userType === UserType.AssessorAdmin)
    );
  }

  handleAssessorFormSubmission(formInfo: { formValue: AssessorReviewDecisionForm; reviewScreenName: string }) {
    this.store.dispatch(
      submitAssessorReviewScreenDecision(formInfo?.reviewScreenName)({
        formValue: formInfo?.formValue,
      })
    );
  }

  downloadFile(fileId: string, fileName: string) {
    this.store.dispatch(downloadFile({ fileId: fileId, fileName: fileName }));
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
}
