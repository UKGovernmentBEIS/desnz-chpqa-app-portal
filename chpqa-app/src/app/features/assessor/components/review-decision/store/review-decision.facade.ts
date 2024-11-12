import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Observable, takeUntil } from 'rxjs';
import { ReviewDcisionSelectors } from './review-decision.selectors';
import { selectFormState } from '@shared/store';
import { ReviewDecisionActions } from './review-decision.actions';
import { selectSubmissionGroup } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { AssessorSelectors } from '../../../store/assessor.selectors';

@Injectable()
export class ReviewDecisionFacade {
    apiGetAssessorsAssessmentGet$ = this.store.pipe(
      select(ReviewDcisionSelectors.selectApiGetAssessorsAssessmentGet)
    );
    
    isAssessorFormEditable$ = this.store.select(AssessorSelectors.AssessorDashboardSelectors.isAssessorFormEditable);
    constructor(
      private store: Store<any>,
      private spinner: NgxSpinnerService
    ) {}

    loadSelectedSubmissionGroup() {
      return this.store.select(selectSubmissionGroup);
    };

    loadReviewDecision() {
      this.store.dispatch(ReviewDecisionActions.loadReviewDecision());
    }
    
    loadReviewDecisionFormInputsFor(reviewScreenName: string) {
        return this.store.select(selectFormState(reviewScreenName));
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
