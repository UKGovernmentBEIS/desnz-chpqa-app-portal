import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { UserType } from '@shared/enums/user-type.enum';
import { FormSubmissionService } from '@shared/services/form-submission.service';
import { SchemeService } from '@shared/services/scheme.service';
import { UnitService } from '@shared/services/unit.service';
import {
  assessorReviewScreenDecisionFailure,
  assessorReviewScreenDecisionInProgress,
  assessorReviewScreenDecisionSuccess,
  fetchAllUnits,
  fetchAllUnitsFailure,
  fetchAllUnitsSuccess,
  navigateTo,
  setScheme,
} from '@shared/store/shared.action';
import { combineLatest, of } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { CookieService } from 'src/app/core/api/cookie.service';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSubmissionGroupId } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { FormWizardPath } from 'src/app/tasks/set-scheme-form-wizard/models/form-wizard-path.model';
import * as SharedActionTypes from './shared.action';
import { selectSubmissionFormId } from './shared.selector';
import { RequestCreateSubmGroupDetails, RequestReturnManuModelEngineUnitId } from 'src/app/api-services/chpqa-api/generated';
import { NgxSpinnerService } from 'ngx-spinner';
import { downloadFile } from '@shared/shared.util';

@Injectable()
export class SharedEffects {
  navigateTo$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(navigateTo),
        tap(action => {
          this.router.navigate([action.url]);
        })
      );
    },
    { dispatch: false }
  );

  saveCookieSettings$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SharedActionTypes.saveCookieSettings),
        tap(action => {
          if (action.acceptAnalyticsCookies) {
            this.cookieService.acceptAllCookies();
          } else {
            this.cookieService.acceptEssentialCookies();
          }
        }),
        filter(action => !!action.navigateTo),
        tap(action => {
          this.router.navigate([action.navigateTo]);
        })
      );
    },
    { dispatch: false }
  );

  setScheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setScheme),
      mergeMap(action => {
        return this.formSubmissionService.getLatestBySchemeId(action.scheme.id).pipe(
          map(submissionForm => {
            let url!: string;
            if (submissionForm.id) {
              this.store.dispatch(
                SharedActionTypes.setSubmissionFormId({
                  submissionFormId: submissionForm.id,
                })
              );
              url = `${FormSubmissionPath.BASE_PATH}/${submissionForm.id}/${FormSubmissionPath.TASK_LIST}`;
            } else {
              url = `${FormWizardPath.BASE_PATH}/${action.scheme.id}/${FormWizardPath.BEFORE_START}`;
            }

            return navigateTo({ url: url });
          })
        );
      })
    )
  );

  fetchAllUnits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchAllUnits),
      switchMap(() =>
        this.unitService.fetchAllUnits().pipe(
          map(() => fetchAllUnitsSuccess()),
          catchError(error => of(fetchAllUnitsFailure({ error })))
        )
      )
    )
  );

  createUnit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActionTypes.createUnit),
      switchMap(action =>
        this.unitService.createUnit(action.createUnitRequest).pipe(
          map((createUnitResponse: RequestReturnManuModelEngineUnitId) => {
            return SharedActionTypes.createUnitSuccess({ createUnitResponse });
          }),
          catchError(error => of(SharedActionTypes.createUnitFailure({ error })))
        )
      )
    )
  );

  submitAssessorReviewScreenDecision$ = createEffect(() =>
    this.actions$.pipe(
      filter((action: Action) => action.type.startsWith('[Assessor Review Screen Decision]')),
      tap(() => this.spinner.show()),
      switchMap((action: any) =>
        combineLatest([
          this.store.select(selectSubmissionFormId),
          this.store.select(selectSubmissionGroupId)
        ]).pipe(
          take(1),
          switchMap(([submissionId, submissionGroupId]) => {
            this.store.dispatch(assessorReviewScreenDecisionInProgress());
            const payload: RequestCreateSubmGroupDetails = {
              submissionId,
              submissionGroupId,
              groupDetails: {
                assessmentOutcome: action.formValue.assessmentOutcome?.value,
                changeNeededComment: action.formValue.changeNeededComment || '',
                sectionAssessmentComment: action.formValue.sectionAssessmentComment || '',
              },
            };

            return this.chqpaApiServiceWrapper.createAssessorsAssessmentService.apiAssessorsCreateAssessorsAssessmentPost(payload).pipe(
              map(() => {
                this.spinner.hide()
                return assessorReviewScreenDecisionSuccess({ formValue: action.formValue });
              }),
              catchError(error => {
                this.spinner.hide();
                return of(assessorReviewScreenDecisionFailure({ error }));
              })
            );
          })
        )
      )
    )
  );


  assessorReviewScreenDecisionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActionTypes.assessorReviewScreenDecisionSuccess),
      switchMap(() =>
        this.store.select(selectSubmissionFormId).pipe(
          map(submissionId => {
            return SharedActionTypes.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/task-list`,
            });
          })
        )
      )
    )
  );

  getUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActionTypes.getUserRole),
      switchMap((action: any) =>
        this.chqpaApiServiceWrapper.getContactByEmailService.apiGetContactByEmailGet().pipe(
          map(response => {
            const payload = {
              ...response,
              userType: response?.userType as UserType,
            };
            return SharedActionTypes.getUserRoleSuccess({ payload });
          }),
          catchError(error => {
            return of(SharedActionTypes.getUserRoleFailure({ error }));
          })
        )
      )
    )
  );

  getUserRoleSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActionTypes.getUserRoleSuccess),
      tap((action) => {
        const assessorRoles = [
          UserType.TechnicalAssessor,
          UserType.TechnicalAssessor2,
          UserType.AssessorAdmin,
        ];

        const isUserAnAssessor = assessorRoles.includes(action.payload.userType);

        this.store.dispatch(
          SharedActionTypes.setIsUserAnAssessorFlag({ isUserAnAssessor })
        );

        this.router.navigate([isUserAnAssessor ? '/assessor' : '/request-task-page']);
      })
    ),
    { dispatch: false }
  );

  downloadFile$ = createEffect(() =>
    this.actions$.pipe(
     ofType(SharedActionTypes.downloadFile),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionId]) =>
        this.chqpaApiServiceWrapper.downloadFileForSubmissionService.apiSecureDownloadFileForSubmissionGet(submissionId, action.fileId).pipe(
          tap((fileData: any) => {
            downloadFile(fileData,  action.fileName);
          }),
          map(response => SharedActionTypes.downloadFileSuccess({ response })),
          catchError(error => of(SharedActionTypes.downloadFileFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private cookieService: CookieService,
    private formSubmissionService: FormSubmissionService,
    private router: Router,
    private schemeService: SchemeService,
    private store: Store,
    private readonly unitService: UnitService,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private spinner: NgxSpinnerService
  ) {}
}
