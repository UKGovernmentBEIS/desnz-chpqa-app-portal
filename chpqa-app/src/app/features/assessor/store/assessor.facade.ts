import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, takeWhile } from 'rxjs';
import { AssessorActions } from './assessor.actions';
import { AssessorSelectors } from './assessor.selectors';
import { AssessorState } from './assessor.reducer';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { ReplyAuditRec, ReplySchemeForAssessor, Person, RequestSubmDueDateConf } from 'src/app/api-services/chpqa-api/generated';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { selectFormState } from '@shared/store';
import {
  AuditIsRecommendedFormState,
  ReasonsForAuditFormState,
  AssessorAuditRecommendationFormState,
} from '../pages/audit-recommendation/audit-recomendation.config';

interface AssessorSharedStateFacade {
  readonly stateObservables: {
    readonly isUserAnAssessor$: Observable<boolean>;
    readonly secondAssessorsList$: Observable<RemoteData<Person[], HttpErrorResponse>>;
    readonly comments$: Observable<any>;
    readonly selectSchemeSecondAssessorId$: Observable<any>;
  };
  readonly dispatchActions: {
    setFlagIsUserAnAssessor: (payload: boolean) => void;
    loadSecondAssessorsList: (payload: boolean) => void;
  };
}

/**
 * Facade for dashboard observables and actions.
 */
interface DashboardStateFacade {
  /** Observables for dashboard state */
  readonly stateObservables: {
    /** Emits the dashboard data wrapped in RemoteData */
    readonly response$: Observable<RemoteData<ReplySchemeForAssessor[], HttpErrorResponse>>;
  };

  /** Dispatch actions for the dashboard */
  readonly dispatchActions: {
    /** Dispatches an action to load dashboard data */
    loadAssessorDashboardData: () => void;
    setSelectedAssessorSchemeId: (schemeId: string) => void;
  };
}

/**
 * Facade for audit recommendations observables and actions.
 */
interface AuditRecommendationStateFacade {
  readonly stateObservables: {
    readonly auditRecommendationsApiResponse$: Observable<RemoteData<ReplyAuditRec, HttpErrorResponse>>;
    readonly isRecommendedFormState$: Observable<AuditIsRecommendedFormState>;
    readonly reasonsForAuditFormState$: Observable<ReasonsForAuditFormState>;
  };
  readonly dispatchActions: {
    loadAuditRecommendations: () => void;
  };
}

/**
 * Facade for confirm rejection observables and actions.
 */
interface ConfirmRejectionStateFacade {
  readonly stateObservables: {
    readonly response$: Observable<RemoteData<any, HttpErrorResponse>>;
  };
  readonly dispatchActions: {
    loadConfirmRejection: () => void;
    submitConfirmationRejection: (secondAssessorId: string) => void;
  };
}

/**
 * Facade for return to RP observables and actions.
 */
interface SubmitAssessmentReturnToRPStateFacade {
  readonly stateObservables: {
    readonly response$: Observable<RemoteData<any, HttpErrorResponse>>;
  };
  readonly dispatchActions: {
    load: () => void;
    submitReturnToRP: () => void;
  };
}

/**
 * Facade for scheme details observables and actions.
 */
interface SchemeDetailsStateFacade {
  readonly stateObservables: {
    readonly response$: Observable<RemoteData<any, HttpErrorResponse>>;
  };
  readonly dispatchActions: {
    load: () => void;
  };
}

/**
 * Facade for submit assessment observables and actions.
 */
interface SubmitAssessmentStateFacade {
  readonly stateObservables: {
    readonly response$: Observable<RemoteData<any, HttpErrorResponse>>;
  };
  readonly dispatchActions: {
    load: (secondAssessorId: string) => void;
  };
}

/**
 * Facade for submit reviewed comments observables and actions.
 */
interface SubmitReviewedCommentsStateFacade {
  readonly stateObservables: {
    readonly response$: Observable<RemoteData<any, HttpErrorResponse>>;
  };
  readonly dispatchActions: {
    submit: () => void;
  };
}

interface SetLastSubmissionDateStateFacade {
  readonly stateObservables: {
    readonly selectSetLastSubmissionDatesResponse$: Observable<RemoteData<any, HttpErrorResponse>>;
    readonly selectGetLastSubmissionDatesResponse$: Observable<RemoteData<any, HttpErrorResponse>>;
    readonly selectUpdatedSubmissionDate$: Observable<any>;
  };
  readonly dispatchActions: {
    setLastSubmissionDate: (payload: RequestSubmDueDateConf) => void;
    getLastSubmissionDate: () => void;
    updateSubmissionDate: (payload: any) => void;
  }
}

/**
 * Facade for return to RP observables and actions.
 */
interface ReturnToRPStateFacade {
  readonly stateObservables: {
    readonly reasonForReturningScheme$: Observable<string>,
    readonly response$: Observable<RemoteData<any, HttpErrorResponse>>;
  };
  readonly dispatchActions: {
    setReasonForReturningScheme: ( reasonForReturningScheme: string) => void;
    load: () => void;
    confirmReturnToRP: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AssessorFacade {
  /**
   * Shared State Assessor facade providing observables for state and dispatching actions.
   */
  public sharedFacade: Readonly<AssessorSharedStateFacade> = {
    stateObservables: {
      isUserAnAssessor$: this.store.select(AssessorSelectors.AssessorSharedSelectors.selectIsUserAnAssessor),
      secondAssessorsList$: this.store.select(AssessorSelectors.AssessorSharedSelectors.selectSecondAssessorsList),
      comments$: this.store.select(AssessorSelectors.AssessorSharedSelectors.selectComments),
      selectSchemeSecondAssessorId$: this.store.select(AssessorSelectors.AssessorDashboardSelectors.selectActiveSchemeSecondAssessorInitialsBySchemeId),
    },
    dispatchActions: {
      setFlagIsUserAnAssessor: (payload: boolean) => this.store.dispatch(AssessorActions.AssessorSharedActions.setFlagIsUserAnAssessor({ payload })),
      loadSecondAssessorsList: (payload: boolean) => this.store.dispatch(AssessorActions.AssessorSharedActions.loadSecondAssessorsList({ payload })),
    },
  };

  /**
   * Dashboard facade providing observables for state and dispatching actions.
   */
  public dashboardFacade: Readonly<DashboardStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.AssessorDashboardSelectors.selectDashboardResponse),
    },
    dispatchActions: {
      loadAssessorDashboardData: () => this.store.dispatch(AssessorActions.AssessorDashboardActions.loadAssessorDashboardData()),
      setSelectedAssessorSchemeId: schemeId => this.store.dispatch(AssessorActions.AssessorDashboardActions.setSelectedAssessorSchemeId({ schemeId })),
    },
  };

  /**
   * Audit Recommendations facade.
   */
  public auditRecommendationsFacade: Readonly<AuditRecommendationStateFacade> = {
    stateObservables: {
      auditRecommendationsApiResponse$: this.store.select(AssessorSelectors.AssessorAuditRecommendationSelectors.selectAuditRecommendationsApiResponse),
      isRecommendedFormState$: this.store.pipe(select(selectFormState(AssessorAuditRecommendationFormState.AssessorIsRecommendedForm))),
      reasonsForAuditFormState$: this.store.pipe(select(selectFormState(AssessorAuditRecommendationFormState.AssessorReasonsForAuditForm))),
    },
    dispatchActions: {
      loadAuditRecommendations: () => this.store.dispatch(AssessorActions.AssessorAuditRecommendationActions.loadAuditRecommendations()),
    },
  };

  /**
   * Confirm Rejection facade.
   */
  public confirmRejectionFacade: Readonly<ConfirmRejectionStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.AssessorConfirmRejectionSelectors.selectConfirmRejectionResponse),
    },
    dispatchActions: {
      loadConfirmRejection: () => this.store.dispatch(AssessorActions.AssessorConfirmRejectionActions.loadConfirmRejection()),
      submitConfirmationRejection: secondAssessorId =>
        this.store.dispatch(AssessorActions.AssessorConfirmRejectionActions.submitConfirmationRejection({ secondAssessorId: secondAssessorId })),
    },
  };

  /**
   * Submit Assessment Return to RP facade.
   */
  public submitAssessmentReturnToRPFacade: Readonly<SubmitAssessmentReturnToRPStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.AssessorSubmitAssessmentReturnToRPSelectors.selectSubmitAssessmentReturnToRPResponse),
    },
    dispatchActions: {
      load: () => this.store.dispatch(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.loadReturnToRP()),
      submitReturnToRP: () => this.store.dispatch(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.submitReturnToRP()),
    },
  };

  /**
   * Scheme Details facade.
   */
  public schemeDetailsFacade: Readonly<SchemeDetailsStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.AssessorSchemeDetailsSelectors.selectSchemeDetailsResponse),
    },
    dispatchActions: {
      load: () => this.store.dispatch(AssessorActions.AssessorSchemeDetailsActions.loadSchemeDetails()),
    },
  };

  /**
   * Submit Assessment facade.
   */
  public submitAssessmentFacade: Readonly<SubmitAssessmentStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.AssessorSubmitAssessmentSelectors.selectSubmitAssessmentResponse),
    },
    dispatchActions: {
      load: secondAssessorId =>
        this.store.dispatch(AssessorActions.AssessorSubmitAssessmentActions.loadSubmitAssessment({ secondAssessorId: secondAssessorId })),
    },
  };

  /**
   * Submit Reviewed Comments facade.
   */
  public submitReviewedCommentsFacade: Readonly<SubmitReviewedCommentsStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.SubmitReviewedCommentsSelectors.selectSubmitReviewedCommentsResponse),
    },
    dispatchActions: {
      submit: () => this.store.dispatch(AssessorActions.SubmitReviewedCommentsActions.submitReviewedComments()),
    },
  };


  public setLastSubmissionDateFacade: Readonly<SetLastSubmissionDateStateFacade> = {
    stateObservables: {
      selectSetLastSubmissionDatesResponse$: this.store.select(AssessorSelectors.SetLastSubmissionDateSelectors.selectSetLastSubmissionDatesResponse),
      selectGetLastSubmissionDatesResponse$: this.store.select(AssessorSelectors.SetLastSubmissionDateSelectors.selectGetLastSubmissionDatesResponse),
      selectUpdatedSubmissionDate$: this.store.select(AssessorSelectors.SetLastSubmissionDateSelectors.selectUpdatedSubmissionDate),
    },
    dispatchActions: {
      setLastSubmissionDate: (payload: RequestSubmDueDateConf) => this.store.dispatch(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDate({payload})),
      getLastSubmissionDate: () => this.store.dispatch(AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDate()),
      updateSubmissionDate: (payload: any) => this.store.dispatch(AssessorActions.SetLastSubmissionDateActions.updateSubmissionDate({payload})),
  
    }
  }
 
      /**
   * Return scheme to RP facade.
   */
  public returnToRP: Readonly<ReturnToRPStateFacade> = {
    stateObservables: {
      response$: this.store.select(AssessorSelectors.AssessorReturnToRPSelectors.selectReturnToRPResponse),
      reasonForReturningScheme$: this.store.select(AssessorSelectors.AssessorReturnToRPSelectors.selectReasonForReturningScheme),
    },
    dispatchActions: {
      confirmReturnToRP: () => this.store.dispatch(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRP()),
      setReasonForReturningScheme: (reasonForReturningScheme) => this.store.dispatch(AssessorActions.ReturnSchemeToRPActions.setReasonForReturningScheme({reasonForReturningScheme})),
      load: () => this.store.dispatch(AssessorActions.ReturnSchemeToRPActions.loadReasonForReturningScheme()),
    },
  };

  showLoadingSpinnerForApiResponses<T>(observables: Observable<RemoteData<T, HttpErrorResponse>>[], isComponentAlive: boolean): void {
    combineLatest(observables)
      .pipe(takeWhile(() => isComponentAlive))
      .subscribe(responses => {
        if (responses.some(response => isInProgress(response))) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });
  }

  constructor(
    private store: Store<AssessorState>,
    private spinner: NgxSpinnerService
  ) {}
}
