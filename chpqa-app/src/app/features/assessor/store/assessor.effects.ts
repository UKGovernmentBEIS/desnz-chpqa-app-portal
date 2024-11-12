import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { OptionItem } from '@shared/models/option-item.model';
import { selectFormState, selectSubmissionFormId } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';
import { combineLatest, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import {
  Person,
  ReplyAuditRec,
  ReplySchemeForAssessor,
  RequestAssessmentDecision,
  RequestAssessorAdminToRPModel,
  RequestAuditRec,
} from 'src/app/api-services/chpqa-api/generated';
import { selectUser } from 'src/app/auth/auth.selector';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { ASSESSOR_ROUTE_PATHS } from '../config/assessor-routes.config';
import { AssessorAuditRecommendationFormState } from '../pages/audit-recommendation/audit-recomendation.config';
import { AssessorAuditRecommendationService } from '../services/assessor-audit-recommendation.service';
import { AssessorDashboardService } from '../services/assessor-dashboard.service';
import { AssessorProvideAssessmentDecisionService } from '../services/assessor-provide-assessment-decision.service';
import { AssessorActions } from './assessor.actions';
import { AssessorFacade } from './assessor.facade';
import { AssessorSelectors } from './assessor.selectors';

@Injectable()
export class AssessorEffects {
  constructor(
    private actions$: Actions,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private assessorFacade: AssessorFacade,
    private store: Store,
    private assessorAuditRecommendationService: AssessorAuditRecommendationService,
    private router: Router,
    private assessorProvideAssessmentDecisionService: AssessorProvideAssessmentDecisionService,
    private location: Location,
    private assessorDashboardService: AssessorDashboardService
  ) {}

  //////////////////////////////////////////////////////
  //               Shared Effects                  //
  //////////////////////////////////////////////////////

  loadSecondAssessorsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorSharedActions.loadSecondAssessorsList),
      withLatestFrom(this.store.select(selectSubmissionFormId)),
      mergeMap(([action, submissionId]) =>
        this.chqpaApiServiceWrapper.getSecondAssessorsService.apiAssessorsGetSecondAssessorsGet(submissionId).pipe(
          map(response =>
            response.map((person: Person) => ({
              id: person.id,
              name: person.firstName.concat(' ', person.lastName),
            }))
          ),
          map((optionItems: OptionItem[]) => AssessorActions.AssessorSharedActions.loadSecondAssessorsListSuccess({ payload: optionItems })),
          catchError(error => of(AssessorActions.AssessorSharedActions.loadSecondAssessorsListFailure({ error })))
        )
      )
    )
  );

  //////////////////////////////////////////////////////
  //               Dashboard Effects                  //
  //////////////////////////////////////////////////////

  loadDashboardData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorDashboardActions.loadAssessorDashboardData),
      mergeMap(() =>
        combineLatest([
          this.store.pipe(select(selectUser)),
          this.chqpaApiServiceWrapper.getSchemesByTAssessorService.apiAssessorsGetSchemesforTAssessorGet(),
        ]).pipe(
          map(([user, response]: [any, ReplySchemeForAssessor[]]) => {
            const mappedResponse = response.map(item => ({
              ...item,
              latestSubmissionStatusText: this.assessorDashboardService.mapUserRoleAndSchemeStatusToProperSubmissionStatusForScheme(
                user?.userType,
                item.latestSubmissionStatus
              ),
            }));
            return AssessorActions.AssessorDashboardActions.loadAssessorDashboardDataSuccess({ payload: mappedResponse });
          }),
          catchError(error => {
            return of(AssessorActions.AssessorDashboardActions.loadAssessorDashboardDataFailure({ error }));
          })
        )
      )
    )
  );

  setLastSubmissionDate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDate),
      mergeMap(action =>
        this.chqpaApiServiceWrapper.updSubmDueDateConfService.apiUpdSubmDueDateConfPost(action.payload).pipe(
          map(() => AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDateSuccess()),
          catchError(error => of(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDateFailure({ error })))
        )
      )
    )
  );

  setLastSubmissionDateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDateSuccess),
        tap(() => {
          this.router.navigate([`/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.whatHappensNext}`]);
        })
      ),
    { dispatch: false }
  );

  getLastSubmissionDate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDate),
      mergeMap(() =>
        this.chqpaApiServiceWrapper.getSubmDueDateService.apiGetSubmDueDateGet().pipe(
          map(payload => AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDateSuccess({ payload })),
          catchError(error => of(AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDateFailure({ error })))
        )
      )
    )
  );

  //////////////////////////////////////////////////////
  //       Audit Recommendation Effects               //
  //////////////////////////////////////////////////////

  loadAuditRecommendations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorAuditRecommendationActions.loadAuditRecommendations),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionId]) => {
        return this.assessorAuditRecommendationService.getAuditRecommendation(submissionId).pipe(
          map(response => {
            return AssessorActions.AssessorAuditRecommendationActions.loadAuditRecommendationsSuccess({
              payload: response,
            });
          }),
          catchError(error =>
            of(
              AssessorActions.AssessorAuditRecommendationActions.loadAuditRecommendationsError({
                error,
              })
            )
          )
        );
      })
    )
  );

  setAuditRecommendations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendations),
      withLatestFrom(
        this.store.pipe(select(selectFormState(AssessorAuditRecommendationFormState.AssessorIsRecommendedForm))),
        this.assessorFacade.auditRecommendationsFacade.stateObservables.isRecommendedFormState$,
        this.assessorFacade.auditRecommendationsFacade.stateObservables.reasonsForAuditFormState$,
        this.assessorFacade.auditRecommendationsFacade.stateObservables.auditRecommendationsApiResponse$,
        this.store.pipe(select(selectSubmissionFormId))
      ),
      mergeMap(([action, isRecommended, isRecommendedFormState, reasonsForAuditFormState, auditRecommendationsApiResponse, submissionFormId]) => {
        const auditRecId = ((auditRecommendationsApiResponse as any).value as ReplyAuditRec).auditRecId;
        const payload: RequestAuditRec = {
          submissionId: submissionFormId,
          isRecommended: isRecommendedFormState.isRecommended.value,
          technicalPerformanceConcerns: reasonsForAuditFormState?.technicalPerformanceConcerns || false,
          complianceConcerns: reasonsForAuditFormState?.complianceConcerns || false,
          comments: reasonsForAuditFormState?.comments || '',
          auditRecId: !!auditRecId ? auditRecId : null,
        };
        return this.assessorAuditRecommendationService.submitAuditRecommendation(payload).pipe(
          map(() => AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendationsSuccess()),
          catchError(error => of(AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendationsError(error)))
        );
      })
    );
  });

  setAuditRecommendationsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendationsSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) => {
        return SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        });
      })
    );
  });

  //////////////////////////////////////////////////////
  //          Confirm Rejection Effects               //
  //////////////////////////////////////////////////////

  submitConfirmationRejection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorConfirmRejectionActions.submitConfirmationRejection),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)) //TODO fix this
      ),
      mergeMap(([action, submissionId]) => {
        const assignSecondAsOrRp = {
          submissionId: submissionId,
          secondAssessorId: action.secondAssessorId,
        };
        return this.chqpaApiServiceWrapper.assignSecondAssessorOrRpService.apiAssessorsAssignSecondAssessorOrRpPost(assignSecondAsOrRp).pipe(
          map(response => AssessorActions.AssessorConfirmRejectionActions.submitConfirmationRejectionSuccess({ payload: response })),
          catchError(error => of(AssessorActions.AssessorConfirmRejectionActions.submitConfirmationRejectionError({ error })))
        );
      })
    )
  );

  //////////////////////////////////////////////////////
  //             Return to RP Effects                 //
  //////////////////////////////////////////////////////

  loadReturnToRP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.loadReturnToRP),
      mergeMap(() =>
        // Simulate a service call here and replace with your actual API call
        of({ data: 'return to RP data' }).pipe(
          map(response => AssessorActions.AssessorSubmitAssessmentReturnToRPActions.returnToRPLoaded({ payload: response })),
          catchError(error => of(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.returnToRPError({ error })))
        )
      )
    )
  );

  submitReturnToRP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.submitReturnToRP),
      withLatestFrom(this.store.select(selectSubmissionFormId)),
      switchMap(([action, submissionFormId]) => {
        const assignSecondAsOrRp = {
          submissionId: submissionFormId,
          secondAssesorId: null,
        };

        return this.chqpaApiServiceWrapper.assignSecondAssessorOrRpService.apiAssessorsAssignSecondAssessorOrRpPost(assignSecondAsOrRp).pipe(
          map(response => AssessorActions.AssessorSubmitAssessmentReturnToRPActions.submitReturnToRPSuccess({ payload: response })),
          catchError(error => of(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.submitReturnToRPError({ error })))
        );
      })
    )
  );

  submitReturnToRPSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.submitReturnToRPSuccess),
        tap(() => {
          this.router.navigate([`/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.submitAssessmentReturnToRP.whatHappensNext}`]);
        })
      ),
    { dispatch: false }
  );

  //////////////////////////////////////////////////////
  //            Scheme Details Effects                //
  //////////////////////////////////////////////////////

  loadSchemeDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorSchemeDetailsActions.loadSchemeDetails),
      mergeMap(() =>
        // Simulate a service call here and replace with your actual API call
        of({ data: 'scheme details data' }).pipe(
          map(response =>
            AssessorActions.AssessorSchemeDetailsActions.schemeDetailsLoaded({
              payload: response,
            })
          ),
          catchError(error => of(AssessorActions.AssessorSchemeDetailsActions.schemeDetailsError({ error })))
        )
      )
    )
  );

  //////////////////////////////////////////////////////
  //         Submit Assessment Effects                //
  //////////////////////////////////////////////////////

  loadSubmitAssessment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorSubmitAssessmentActions.loadSubmitAssessment),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)) //TODO fix this
      ),
      mergeMap(([action, submissionId]) => {
        const assignSecondAsOrRp = {
          submissionId: submissionId,
          secondAssessorId: action.secondAssessorId,
        };
        return this.chqpaApiServiceWrapper.assignSecondAssessorOrRpService.apiAssessorsAssignSecondAssessorOrRpPost(assignSecondAsOrRp).pipe(
          map(response => AssessorActions.AssessorConfirmRejectionActions.submitConfirmationRejectionSuccess({ payload: response })),
          catchError(error => of(AssessorActions.AssessorConfirmRejectionActions.submitConfirmationRejectionError({ error })))
        );
      })
    )
  );

  //////////////////////////////////////////////////////
  //         Provide Assessment Decision Effects      //
  //////////////////////////////////////////////////////

  submitProvideAssessmentDecision$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.AssessorProvideAssessmentDecisionActions.submitProvideAssessmentDecision),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionFormId]) => {
        const payload: RequestAssessmentDecision = {
          submissionId: submissionFormId,
          certifyChoice: !!action.payload.dateOfCertification,
          dateOfCertification: action.payload.dateOfCertification,
          comments: action.payload.commentsForFirstAssessor,
        };

        return this.assessorProvideAssessmentDecisionService
          .submitProvideAssessmentDecision(payload)
          .pipe(map(() => AssessorActions.AssessorProvideAssessmentDecisionActions.submitProvideAssessmentSuccess({ certifyChoice: payload.certifyChoice })));
      })
    )
  );

  submitProvideAssessmentSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssessorActions.AssessorProvideAssessmentDecisionActions.submitProvideAssessmentSuccess),
      map(action => {
        const url = action.certifyChoice
          ? `/assessor/${ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.schemeCertified}`
          : `/assessor/${ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.returnedToFirstAssessor}`;
        return SharedActions.navigateTo({ url });
      })
    );
  });

  //////////////////////////////////////////////////////
  //         Submit Reviewed Comments Effects                //
  //////////////////////////////////////////////////////

  submitReviewedComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.SubmitReviewedCommentsActions.submitReviewedComments),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)) //TODO fix this
      ),
      mergeMap(([action, submissionId]) => {
        const requestUpdSubmReviewTA1Comments = {
          idSubmission: submissionId,
        };
        return this.chqpaApiServiceWrapper.updSubmReviewTA1CommentsService.apiSecureUpdSubmReviewTA1CommentsPost(requestUpdSubmReviewTA1Comments).pipe(
          map(response => AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsSuccess({ payload: response })),
          catchError(error => of(AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsError({ error })))
        );
      })
    )
  );

  submitReviewedCommentSuccesss$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsSuccess),
        tap(() => this.location.back())
      ),
    { dispatch: false }
  );

  //////////////////////////////////////////////////////
  //         Return scheme to RP Actions               //
  //////////////////////////////////////////////////////

  confirmReturnSchemeToRP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRP),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(AssessorSelectors.AssessorReturnToRPSelectors.selectReasonForReturningScheme))
      ),
      mergeMap(([action, submissionId, comments]) => {
        const requestAssessorAdminToRPModel: RequestAssessorAdminToRPModel = {
          idSubmission: submissionId,
          comments: comments,
        };
        return this.chqpaApiServiceWrapper.postAdminAssessorCommentService.apiAssessorsPostAdminAssessorCommentPost(requestAssessorAdminToRPModel).pipe(
          map(response => AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRPSuccess({ payload: response })),
          catchError(error => of(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRPError({ error })))
        );
      })
    )
  );

  confirmReturnSchemeToRPSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRPSuccess),
      map(() => {
        const url = `/assessor/${ASSESSOR_ROUTE_PATHS.returnToRP.whatHappensNext}`;
        return SharedActions.navigateTo({ url });
      })
    )
  );

  loadReasonForReturningScheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.ReturnSchemeToRPActions.loadReasonForReturningScheme),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionId]) => {
        return this.chqpaApiServiceWrapper.getAssessorsAdminCommentService.apiSecureGetAssessorAdminCommentGet(submissionId).pipe(
          map(response => AssessorActions.ReturnSchemeToRPActions.loadReasonForReturningSchemeSuccess({ payload: response })),
          catchError(error => of(AssessorActions.ReturnSchemeToRPActions.loadReasonForReturningSchemeError({ error })))
        );
      })
    )
  );

  loadReasonForReturningSchemeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssessorActions.ReturnSchemeToRPActions.loadReasonForReturningSchemeSuccess),
      map(action => AssessorActions.ReturnSchemeToRPActions.setReasonForReturningScheme({ reasonForReturningScheme: action.payload }))
    )
  );
}
