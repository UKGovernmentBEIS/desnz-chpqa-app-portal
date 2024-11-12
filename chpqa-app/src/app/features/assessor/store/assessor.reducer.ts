import { Action, createReducer, on } from '@ngrx/store';
import { AssessorActions } from './assessor.actions';
import { ReplyAuditRec, ReplySchemeForAssessor, ReplySubmissionGroupCommentsTA1 } from 'src/app/api-services/chpqa-api/generated';
import { HttpErrorResponse } from '@angular/common/http';
import { notAsked, inProgress, success, failure, RemoteData, isSuccess } from 'ngx-remotedata';

//////////////////////////////////////////////////////
//                 Initial State                    //
//////////////////////////////////////////////////////

// Define the state structure for each page
export interface AssessorSharedState {
  isUserAnAssessor: boolean;
  secondAssesorsList: RemoteData<any[], HttpErrorResponse>;
  comments: ReplySubmissionGroupCommentsTA1[];
}

export interface DashboardState {
  dashboardDataApiResponse: RemoteData<any[], HttpErrorResponse>;
  selectedAssessorSchemeId: string;
}

export interface SetLastSubmissionDateState {
  getLastSubmissionDateApiResponse: RemoteData<any, HttpErrorResponse>;
  setLastSubmissionDateApiResponse: RemoteData<any, HttpErrorResponse>;
  submissionDate: any;
}

export interface AuditRecommendationsState {
  data: RemoteData<ReplyAuditRec, HttpErrorResponse>;
}

export interface ConfirmRejectionState {
  data: RemoteData<any, HttpErrorResponse>;
}

export interface SubmitAssessmentReturnToRPState {
  data: RemoteData<any, HttpErrorResponse>;
}

export interface SchemeDetailsState {
  data: RemoteData<any, HttpErrorResponse>;
}

export interface SubmitAssessmentState {
  data: RemoteData<any, HttpErrorResponse>;
}

export interface SubmiReviewedCommentsState {
  data: RemoteData<any, HttpErrorResponse>;
}

export interface ReturnToRPState {
  reasonForReturningScheme: string;
  data: RemoteData<any, HttpErrorResponse>;
}

// Main AssessorState that groups all the pages
export interface AssessorState {
  shared: AssessorSharedState;
  pages: {
    dashboard: DashboardState;
    auditRecommendations: AuditRecommendationsState;
    confirmRejection: ConfirmRejectionState;
    submitAssessmentReturnToRP: SubmitAssessmentReturnToRPState;
    schemeDetails: SchemeDetailsState;
    submitAssessment: SubmitAssessmentState;
    submitReviewedComments: SubmiReviewedCommentsState;
    setLastSubmissionDate: SetLastSubmissionDateState;
    returnToRP: ReturnToRPState;
  };
}

// Initial state for shared state
const inititalSharedState: AssessorSharedState = {
  isUserAnAssessor: false,
  secondAssesorsList: notAsked(),
  comments: null,
};

// Initial state for each page using RemoteData
const initialDashboardState: DashboardState = {
  dashboardDataApiResponse: notAsked(),
  selectedAssessorSchemeId: null,
};

const initialSetLastSubmissionDatedState: SetLastSubmissionDateState = {
  getLastSubmissionDateApiResponse: notAsked(),
  setLastSubmissionDateApiResponse: notAsked(),
  submissionDate: null
};

const initialAuditRecommendationsState: AuditRecommendationsState = {
  data: notAsked(),
};

const initialConfirmRejectionState: ConfirmRejectionState = {
  data: notAsked(),
};

const initialSubmitAssessmentReturnToRPState: SubmitAssessmentReturnToRPState = {
  data: notAsked(),
};

const initialSchemeDetailsState: SchemeDetailsState = {
  data: notAsked(),
};

const initialSubmitAssessmentState: SubmitAssessmentState = {
  data: notAsked(),
};

const initialSubmitReviewedCommentsState: SubmiReviewedCommentsState = {
  data: notAsked(),
};

const initialReturnToRPState: ReturnToRPState = {
  reasonForReturningScheme: '',
  data: notAsked(),
};

// The initial state for the assessor module
export const initialState: AssessorState = {
  shared: inititalSharedState,
  pages: {
    dashboard: initialDashboardState,
    auditRecommendations: initialAuditRecommendationsState,
    confirmRejection: initialConfirmRejectionState,
    submitAssessmentReturnToRP: initialSubmitAssessmentReturnToRPState,
    schemeDetails: initialSchemeDetailsState,
    submitAssessment: initialSubmitAssessmentState,
    submitReviewedComments: initialSubmitReviewedCommentsState,
    setLastSubmissionDate: initialSetLastSubmissionDatedState,
    returnToRP: initialReturnToRPState
  },
};

//////////////////////////////////////////////////////
//             Reducer with on() Handlers            //
//////////////////////////////////////////////////////

export const assessorReducer = createReducer(
  initialState,

  ////////////////////////////////////////////////////
  //              Shared Handlers                   //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorSharedActions.setFlagIsUserAnAssessor, (state, { payload }) => ({
    ...state,
    shared: {
      isUserAnAssessor: payload,
      ...state.shared,
    },
  })),
  on(AssessorActions.AssessorSharedActions.loadSecondAssessorsList, (state, { payload }) => ({
    ...state,
    shared: {
      ...state.shared,
      secondAssesorsList: inProgress() as any,
    },
  })),
  on(AssessorActions.AssessorSharedActions.loadSecondAssessorsListSuccess, (state, { payload }) => ({
    ...state,
    shared: {
      ...state.shared,
      secondAssesorsList: success(payload) as any,
    },
  })),
  on(AssessorActions.AssessorSharedActions.loadSecondAssessorsListFailure, (state, { error }) => ({
    ...state,
    shared: {
      ...state.shared,
      secondAssesorsList: failure(error) as any,
    },
  })),
  
  on(AssessorActions.AssessorSharedActions.updateComments, (state, { payload }) => ({
    ...state,
    shared: {
      ...state.shared,
      comments: payload
    }
  })),

  ////////////////////////////////////////////////////
  //              Dashboard Handlers                //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorDashboardActions.loadAssessorDashboardData, state => ({
    ...state,
    pages: {
      ...state.pages,
      dashboard: { ...state.pages.dashboard, dashboardDataApiResponse: inProgress() as any },
    },
  })),

  on(AssessorActions.AssessorDashboardActions.loadAssessorDashboardDataSuccess, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      dashboard: {
        ...state.pages.dashboard,
        dashboardDataApiResponse: success(payload) as any,
      },
    },
  })),

  on(AssessorActions.AssessorDashboardActions.loadAssessorDashboardDataFailure, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      dashboard: { ...state.pages.dashboard, dashboardDataApiResponse: failure(error) as any },
    },
  })),

  on(AssessorActions.AssessorDashboardActions.setSelectedAssessorSchemeId, (state, { schemeId }) => ({
    ...state,
    pages: {
      ...state.pages,
      dashboard: { ...state.pages.dashboard, selectedAssessorSchemeId: schemeId },
    },
  })),

  ////////////////////////////////////////////////////
  //      Audit Recommendation Handlers             //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorAuditRecommendationActions.loadAuditRecommendations, state => ({
    ...state,
    pages: {
      ...state.pages,
      auditRecommendations: { ...state.pages.auditRecommendations, data: inProgress() as any },
    },
  })),

  on(AssessorActions.AssessorAuditRecommendationActions.loadAuditRecommendationsSuccess, (state, { payload }) => {
    return {
      ...state,
      pages: {
        ...state.pages,
        auditRecommendations: {
          ...state.pages.auditRecommendations,
          data: {
            ...state.pages.auditRecommendations.data,
            ...(success(payload) as any),
          },
        },
      },
    };
  }),

  on(AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendationsError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      auditRecommendations: { ...state.pages.auditRecommendations, data: failure(error) as any },
    },
  })),

  ////////////////////////////////////////////////////
  //          Confirm Rejection Handlers            //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorConfirmRejectionActions.loadConfirmRejection, state => ({
    ...state,
    pages: {
      ...state.pages,
      confirmRejection: { ...state.pages.confirmRejection, data: inProgress() as any },
    },
  })),

  on(AssessorActions.AssessorConfirmRejectionActions.confirmRejectionLoaded, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      confirmRejection: { ...state.pages.confirmRejection, data: success(payload) as any },
    },
  })),

  on(AssessorActions.AssessorConfirmRejectionActions.confirmRejectionError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      confirmRejection: { ...state.pages.confirmRejection, data: failure(error) as any },
    },
  })),

  ////////////////////////////////////////////////////
  //    Submit Assessment Return to RP Handlers     //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.loadReturnToRP, state => ({
    ...state,
    pages: {
      ...state.pages,
      submitAssessmentReturnToRP: { ...state.pages.submitAssessmentReturnToRP, data: inProgress() as any },
    },
  })),

  on(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.returnToRPLoaded, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitAssessmentReturnToRP: { ...state.pages.submitAssessmentReturnToRP, data: success(payload) as any },
    },
  })),

  on(AssessorActions.AssessorSubmitAssessmentReturnToRPActions.returnToRPError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitAssessmentReturnToRP: { ...state.pages.submitAssessmentReturnToRP, data: failure(error) as any },
    },
  })),

  ////////////////////////////////////////////////////
  //            Scheme Details Handlers             //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorSchemeDetailsActions.loadSchemeDetails, state => ({
    ...state,
    pages: {
      ...state.pages,
      schemeDetails: { ...state.pages.schemeDetails, data: inProgress() as any },
    },
  })),

  on(AssessorActions.AssessorSchemeDetailsActions.schemeDetailsLoaded, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      schemeDetails: { ...state.pages.schemeDetails, data: success(payload) as any },
    },
  })),

  on(AssessorActions.AssessorSchemeDetailsActions.schemeDetailsError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      schemeDetails: { ...state.pages.schemeDetails, data: failure(error) as any },
    },
  })),

  ////////////////////////////////////////////////////
  //          Submit Assessment Handlers            //
  ////////////////////////////////////////////////////
  on(AssessorActions.AssessorSubmitAssessmentActions.loadSubmitAssessment, state => ({
    ...state,
    pages: {
      ...state.pages,
      submitAssessment: { ...state.pages.submitAssessment, data: inProgress() as any },
    },
  })),

  on(AssessorActions.AssessorSubmitAssessmentActions.submitAssessmentLoaded, (state, { id }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitAssessment: { ...state.pages.submitAssessment, data: success(id) as any },
    },
  })),

  on(AssessorActions.AssessorSubmitAssessmentActions.submitAssessmentError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitAssessment: { ...state.pages.submitAssessment, data: failure(error) as any },
    },
  })),

  ////////////////////////////////////////////////////
  //         Submit Reviewed Comments Handlers            //
  ////////////////////////////////////////////////////
  on(AssessorActions.SubmitReviewedCommentsActions.submitReviewedComments, state => ({
    ...state,
    pages: {
      ...state.pages,
      submitReviewedComments: { ...state.pages.submitReviewedComments, data: inProgress() as any },
    },
  })),

  on(AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsSuccess, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitReviewedComments: { ...state.pages.submitReviewedComments, data: success(payload) as any },
    },
  })),

  on(AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitReviewedComments: { ...state.pages.submitReviewedComments, data: failure(error) as any },
    },
  })),

   ////////////////////////////////////////////////////
  //         Set Last Submission Date               //
  ////////////////////////////////////////////////////
  on(AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDate, state => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, getLastSubmissionDateApiResponse: inProgress() as any },
    },
  })),

  on(AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDateSuccess, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, getLastSubmissionDateApiResponse: success(payload) as any },
    },
  })),

  on(AssessorActions.SetLastSubmissionDateActions.getLastSubmissionDateFailure, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, getLastSubmissionDateApiResponse: failure(error) as any },
    },
  })),

  on(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDate, state => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, setLastSubmissionDateApiResponse: inProgress() as any },
    },
  })),

  on(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDateSuccess, (state) => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, setLastSubmissionDateApiResponse: success(null) as any },
    },
  })),

  on(AssessorActions.SetLastSubmissionDateActions.setLastSubmissionDateFailure, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, setLastSubmissionDateApiResponse: failure(error) as any },
    },
  })),

  on(AssessorActions.SetLastSubmissionDateActions.updateSubmissionDate, (state,  {payload} ) => ({
    ...state,
    pages: {
      ...state.pages,
      setLastSubmissionDate: { ...state.pages.setLastSubmissionDate, submissionDate: payload as any },
    },
  })),
    ////////////////////////////////////////////////////
  //         Submit Reviewed Comments Handlers            //
  ////////////////////////////////////////////////////
  on(AssessorActions.SubmitReviewedCommentsActions.submitReviewedComments, state => ({
    ...state,
    pages: {
      ...state.pages,
      submitReviewedComments: { ...state.pages.submitReviewedComments, data: inProgress() as any },
    },
  })),

  on(AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsSuccess, (state, { payload }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitReviewedComments: { ...state.pages.submitReviewedComments, data: success(payload) as any },
    },
  })),

  on(AssessorActions.SubmitReviewedCommentsActions.submitReviewedCommentsError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      submitReviewedComments: { ...state.pages.submitReviewedComments, data: failure(error) as any },
    },
  })),

  ////////////////////////////////////////////////////
  //             Return to RP Handlers              //
  ////////////////////////////////////////////////////
  on(AssessorActions.ReturnSchemeToRPActions.setReasonForReturningScheme, (state, { reasonForReturningScheme })  => ({
    ...state,
    pages: {
      ...state.pages,
      returnToRP: { ...state.pages.returnToRP, reasonForReturningScheme: reasonForReturningScheme},
    },
  })),

  on(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRP, state  => ({
    ...state,
    pages: {
      ...state.pages,
      returnToRP: { ...state.pages.returnToRP, data: inProgress() as any },
    },
  })),
  on(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRPSuccess, (state, { payload })  => ({
    ...state,
    pages: {
      ...state.pages,
      returnToRP: { ...state.pages.returnToRP, data: success(payload) as any },
    },
  })),

  on(AssessorActions.ReturnSchemeToRPActions.confirmReturnSchemeToRPError, (state, { error }) => ({
    ...state,
    pages: {
      ...state.pages,
      returnToRP: { ...state.pages.returnToRP, data: failure(error) as any },
    },
  })),


);

//////////////////////////////////////////////////////
//               Final Reducer Export               //
//////////////////////////////////////////////////////

export function reducer(state: AssessorState | undefined, action: Action) {
  return assessorReducer(state, action);
}
