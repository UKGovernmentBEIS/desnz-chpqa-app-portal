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
import * as SharedActions from '@shared/store/shared.action';
import { HeatRejectionFacilityActions } from './heat-rejection-facility.actions';

@Injectable()
export class HeatRejectionFacilityEffects {
  setHeatRejectionFacility$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(HeatRejectionFacilityActions.setHeatRejectionFacility),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.HEAT_REJECTION_FACILITY_SUMMARY}`,
        })
      )
    );
  });

  setHeatRejectionFacilityAsComplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HeatRejectionFacilityActions.setHeatRejectionFacilityAsComplete),
      mergeMap(action =>
        this.chqpaApiServiceWrapper.updSubmHeatRejFacService.apiSecureUpdSubmHeatRejFacPost(action.payload).pipe(
          map(response => HeatRejectionFacilityActions.submitHeatRejectionFacilitySuccess({ response })),
          catchError(error => of(HeatRejectionFacilityActions.submitHeatRejectionFacilityFailure({ error })))
        )
      )
    )
  );

  submitHeatRejectionFacilitySuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(HeatRejectionFacilityActions.submitHeatRejectionFacilitySuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      switchMap(([action, submissionId]) =>
        this.formSubmissionService.getSubmissionForm(submissionId).pipe(
          tap(response => {
            this.store.dispatch(setSubmissionForm({ formSubmission: response }));
          }),
          map(() =>
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
            })
          )
        )
      )
    );
  });

  submitHeatRejectionFacilityInputsFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(HeatRejectionFacilityActions.submitHeatRejectionFacilityFailure),
        tap(({ error }) => {
          console.error('Failed to submit heat rejection facility', error);
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
