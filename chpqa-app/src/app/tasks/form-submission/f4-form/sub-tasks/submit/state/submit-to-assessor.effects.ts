import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { FormSubmissionService } from '@shared/services/form-submission.service';
import { selectSubmissionFormId } from '@shared/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { setSubmissionForm } from 'src/app/tasks/form-submission/store';
import { ChqpaApiServiceWrapper } from '../../../../../../api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import * as SharedActions from '../../../../../../shared/store/shared.action';
import { SubmitToAssessorActions } from './submit-to-assessor.actions';
import { SubmitToAssessorRouting } from '../config/submit.routing';

@Injectable()
export class SubmitToAssessorEffects {
  submitSubmitToAssessor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubmitToAssessorActions.submitToAssessor),
      mergeMap(action =>
        this.chqpaApiServiceWrapper.updSubmtoAssessorService.apiSecureUpdSubmtoAssessorPost(action.payload).pipe(
          map(response => SubmitToAssessorActions.submitToAssessorSuccess({ response })),
          catchError(error => of(SubmitToAssessorActions.submitToAssessorFailure({ error })))
        )
      )
    )
  );

  submitSubmitToAssessorSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SubmitToAssessorActions.submitToAssessorSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      switchMap(([action, submissionId]) =>
        // Fetch the updated submission form data before navigating
        this.formSubmissionService.getSubmissionForm(submissionId).pipe(
          tap(response => {
            // Dispatch an action to update the submission form in the store
            this.store.dispatch(setSubmissionForm({ formSubmission: response }));
          }),
          map(() =>
            // Navigate to the next page after the data has been stored
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${SubmitToAssessorRouting.SUBMIT_SUCCESS}`,
            })
          )
        )
      )
    );
  });

  submitSubmitToAssessorFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SubmitToAssessorActions.submitToAssessorFailure),
        tap(({ error }) => {
          console.error('Failed to submit to assessor ', error);
        })
      ),
    { dispatch: false }
  );


  constructor(
    private actions$: Actions,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private store: Store<any>,
    private formSubmissionService: FormSubmissionService
  ) {}
}
