import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { ReviewDecisionActions } from './review-decision.actions';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { selectSubmissionGroupId } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class ReviewDecisionEffects {
  constructor(
    private actions$: Actions,
    private chpqaApiService: ChqpaApiServiceWrapper,
    private store: Store,
    private spinner: NgxSpinnerService
  ) {}

  loadReviewDecision$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewDecisionActions.loadReviewDecision),
      tap(() => this.spinner.show()),
      withLatestFrom(
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      mergeMap(([action, submissionId, groupId]) =>
        this.chpqaApiService.getAssessorsAssessmentService.apiAssessorsGetAssessorsAssessmentGet(submissionId, groupId).pipe(
          map((response) => {
            this.spinner.hide();
            return ReviewDecisionActions.reviewDecisionLoaded({ response });
          }),
          catchError((error) => {
            this.spinner.hide();
            return of(ReviewDecisionActions.reviewDecisionError({ error }));
          })
        )
      )
    )
  );
}
