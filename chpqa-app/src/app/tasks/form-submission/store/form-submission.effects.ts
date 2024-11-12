import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import * as SharedActions from '@shared/store/shared.action';
import * as FormSubmissionsActions from './form-submission.actions';
import { select, Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { of } from 'rxjs';
import { FormSubmissionPath } from '../model/form-submission-path.model';
import {
  selectFinancialBenefits,
  selectSubmissionGroupId,
  selectSubmitToAssessorGroupId,
} from './form-submission.selectors';
import { FinancialBenefitsService } from '../f4-form/services/financial-benefits.service';
import { Status } from '@shared/enums/status.enum';
import { SubmitToAssessorService } from '../services/submit-to-assessor.service';
import {
  setTotalFuelEnergyBoilers,
  setTotalFuelEnergyPrimeEngines,
} from './form-submission.actions';
import { Router } from '@angular/router';
import { SubmissionGroupTypeRoutes } from '@shared/enums/form-submission.enum';
@Injectable()
export class FormSubmissionsEffects {

  SubmissionGroupTypeRoutes = SubmissionGroupTypeRoutes;

  setSubmissionForm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormSubmissionsActions.setSubmissionForm),
      switchMap(action => [
        setTotalFuelEnergyPrimeEngines({
          estimatedTotalFuelEnergyPrimeEngines:
            action.formSubmission.estimatedTotalFuelEnergyPrimeEngines,
        }),
        setTotalFuelEnergyBoilers({
          estimatedTotalFuelEnergyBoilers:
            action.formSubmission.estimatedTotalFuelEnergyBoilers,
        }),
        FormSubmissionsActions.setTotalHeatOutputPrimeMovers({
          estimatedTotalHeatOutputUsedInthePrimeMovers:
            action.formSubmission.estimatedTotalHeatOutputUsedInthePrimeMovers,
        }),
        FormSubmissionsActions.setTotalHeatOutputBoilers({
          estimatedTotalHeatOutputUsedIntheBoilers:
            action.formSubmission.estimatedTotalHeatOutputUsedIntheBoilers,
        }),
        FormSubmissionsActions.setCondensingSteamTurbineFromFormSubmission({
          condensingSteamTurbine: {
            zRatioDetermined: {
              label:
                action.formSubmission.zRatioDetermined === true ||
                action.formSubmission.zRatioDetermined === false
                  ? action.formSubmission.zRatioDetermined
                    ? 'Yes'
                    : 'No'
                  : null,
              value:
                action.formSubmission.zRatioDetermined === true ||
                action.formSubmission.zRatioDetermined === false
                  ? action.formSubmission.zRatioDetermined
                  : null,
            },
            possibleToDetermineZRatio:
              action.formSubmission.possibleToDetermineZRatio,
            steamExportPressure: action.formSubmission.steamExportPressure,
            steamTurbineSize: action.formSubmission.steamturbinesize,
            zRatio: action.formSubmission.zratio,
          },
        }),
      ])
    )
  );

  setFinancialBenefits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormSubmissionsActions.setFinancialBenefits),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.FINANCIAL_BENEFITS_SUMMARY}`,
        })
      )
    )
  );

  submitFinancialBenefits$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FormSubmissionsActions.submitFinancialBenefits),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.select(selectSubmissionGroupId),
        this.store.pipe(select(selectFinancialBenefits))
      ),
      mergeMap(([action, submissionId, groupId, financialBenefits]) => {
        return this.financialBenefitsService
          .create(submissionId, groupId, financialBenefits)
          .pipe(
            switchMap(() => [
              FormSubmissionsActions.submitFinancialBenefitsSuccess(),
            ]),
            catchError(error => {
              return of(
                FormSubmissionsActions.submitFinancialBenefitsFail({ error })
              );
            })
          );
      })
    );
  });

  submitFinancialBenefitsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FormSubmissionsActions.submitFinancialBenefitsSuccess),
      map(action =>
        FormSubmissionsActions.updateSubmitToAssessorStatus({
          newStatus: Status.NotStarted,
        })
      )
    );
  });

  // updateSubmitToAssessorStatus$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(FormSubmissionsActions.updateSubmitToAssessorStatus),
  //     withLatestFrom(
  //       this.store.select(selectSubmissionFormId),
  //       this.store.select(selectSubmitToAssessorGroupId)
  //     ),
  //     mergeMap(([action, submissionId, submitToAssessorGroupId]) => {
  //       return this.submitToAssessorService
  //         .updateStatus(submissionId, submitToAssessorGroupId, action.newStatus)
  //         .pipe(
  //           map(() =>
  //             FormSubmissionsActions.updateSubmitToAssessorStatusSuccess()
  //           ),
  //           catchError(error =>
  //             of(
  //               FormSubmissionsActions.updateSubmitToAssessorStatusFailure({
  //                 error,
  //               })
  //             )
  //           )
  //         );
  //     })
  //   );
  // });

  updateSubmitToAssessorStatusSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FormSubmissionsActions.updateSubmitToAssessorStatus),
      withLatestFrom(this.store.select(selectSubmissionFormId)),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  setSubmissionGroupIdAndNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FormSubmissionsActions.setSubmissionGroupIdAndNavigate),
        withLatestFrom(this.store.select(selectSubmissionFormId)),
        map(([action, formId]) => {
          const groupType = action.groupType;
          this.router.navigate([`${FormSubmissionPath.BASE_PATH}/${formId}/${this.SubmissionGroupTypeRoutes[groupType]}`]);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private router: Router,
    private readonly financialBenefitsService: FinancialBenefitsService,
    private readonly submitToAssessorService: SubmitToAssessorService
  ) {}
}
