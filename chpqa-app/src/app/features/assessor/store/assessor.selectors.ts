import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssessorState } from './assessor.reducer';
import { isSuccess } from 'ngx-remotedata';
import { SubmissionStatus } from '@shared/enums/status.enum';
import { selectUser } from 'src/app/auth/auth.selector';
import { UserType } from '@shared/enums/user-type.enum';
import { selectSelectedScheme } from '@shared/store';

//////////////////////////////////////////////////////
//                 Base Selector                    //
//////////////////////////////////////////////////////

// Select the assessor feature state from the global store
export const selectAssessorState = createFeatureSelector<AssessorState>('assessor');

//////////////////////////////////////////////////////
//               Shared Selectors                   //
//////////////////////////////////////////////////////

const selectSharedState = createSelector(selectAssessorState, (state: AssessorState) => state.shared);

const selectIsUserAnAssessor = createSelector(selectSharedState, shared => shared.isUserAnAssessor);

const selectSecondAssessorsList = createSelector(selectSharedState, shared => shared.secondAssesorsList);

const selectComments = createSelector(selectSharedState, shared => shared.comments);

export const AssessorSharedSelectors = {
  selectSharedState,
  selectIsUserAnAssessor,
  selectSecondAssessorsList,
  selectComments,
};

//////////////////////////////////////////////////////
//               Dashboard Selectors                //
//////////////////////////////////////////////////////

// Select the entire dashboard response object (RemoteData)
const selectDashboardResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.dashboard.dashboardDataApiResponse);

const selectAssessorSchemeId = createSelector(selectAssessorState, (state: AssessorState) => state.pages.dashboard.selectedAssessorSchemeId);

const selectAssessorInititalsBySchemeId = createSelector(selectDashboardResponse, selectAssessorSchemeId, (dashboardResponse, schemeId) => {
  if (isSuccess(dashboardResponse)) {
    const scheme = dashboardResponse.value.find((item: any) => item.id === schemeId);
    return scheme ? scheme.assessor?.firstName + ' ' + scheme.assessor?.lastName : null;
  }
  return null;
});

const isAssessorFormEditable = createSelector(selectDashboardResponse, selectAssessorSchemeId, (dashboardResponse, schemeId) => {
  if (isSuccess(dashboardResponse)) {
    const scheme = dashboardResponse.value.find((item: any) => item.id === schemeId);
    return scheme ? scheme.latestSubmissionStatus === SubmissionStatus.Submitted : false
  }
  return false;
});


const selectAssessorSelectedScheme = createSelector(selectUser, selectDashboardResponse, selectSelectedScheme, (user, dashboardResponse, selectedScheme) => {
  if (user?.userType !== UserType.AssessorAdmin) {
    return null;
  }
  if (!isSuccess(dashboardResponse)) {
    return null;
  }
  const scheme = dashboardResponse.value.find(scheme => {
    return scheme.id === selectedScheme.id;
  });
  return scheme;
});


const selectActiveSchemeSecondAssessorInitialsBySchemeId = createSelector(selectDashboardResponse, selectAssessorSchemeId, (dashboardResponse, schemeId) => {
  if (isSuccess(dashboardResponse)) {
    const scheme = dashboardResponse.value.find((item: any) => item.id === schemeId);
    return scheme ? {id: scheme.secondAssessor?.id, name: scheme.secondAssessor?.firstName + ' ' + scheme.secondAssessor?.lastName } : null
  }
  return false;
});

export const AssessorDashboardSelectors = {
  selectDashboardResponse,
  selectAssessorSchemeId,
  selectAssessorInititalsBySchemeId,
  isAssessorFormEditable,
  selectActiveSchemeSecondAssessorInitialsBySchemeId,
  selectAssessorSelectedScheme
};
//////////////////////////////////////////////////////
//       Audit Recommendation Selectors             //
//////////////////////////////////////////////////////

// Select the entire audit recommendations response object (RemoteData)
const selectAuditRecommendationsApiResponse = createSelector(selectAssessorState, (state: AssessorState) => {
  return state.pages.auditRecommendations.data;
});

export const AssessorAuditRecommendationSelectors = {
  selectAuditRecommendationsApiResponse,
};

//////////////////////////////////////////////////////
//           Confirm Rejection Selectors            //
//////////////////////////////////////////////////////

// Select the entire confirm rejection response object (RemoteData)
const selectConfirmRejectionResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.confirmRejection.data);

export const AssessorConfirmRejectionSelectors = {
  selectConfirmRejectionResponse,
};

//////////////////////////////////////////////////////
//    Submit Assessment Return to RP Selectors      //
//////////////////////////////////////////////////////

// Select the entire return to RP response object (RemoteData)
const selectSubmitAssessmentReturnToRPResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.submitAssessmentReturnToRP.data);

export const AssessorSubmitAssessmentReturnToRPSelectors = {
  selectSubmitAssessmentReturnToRPResponse,
};

//////////////////////////////////////////////////////
//           Scheme Details Selectors               //
//////////////////////////////////////////////////////

// Select the entire scheme details response object (RemoteData)
const selectSchemeDetailsResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.schemeDetails.data);

export const AssessorSchemeDetailsSelectors = {
  selectSchemeDetailsResponse,
};

//////////////////////////////////////////////////////
//         Submit Assessment Selectors              //
//////////////////////////////////////////////////////

// Select the entire submit assessment response object (RemoteData)
const selectSubmitAssessmentResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.submitAssessment.data);

export const AssessorSubmitAssessmentSelectors = {
  selectSubmitAssessmentResponse,
};

//////////////////////////////////////////////////////
//         Submit Reviewed Comments Selectors              //
//////////////////////////////////////////////////////

const selectSubmitReviewedCommentsResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.submitReviewedComments.data);

export const SubmitReviewedCommentsSelectors = {
  selectSubmitReviewedCommentsResponse,
};

//////////////////////////////////////////////////////
//         Set Last Submission Date Selectors              //
//////////////////////////////////////////////////////

const selectSetLastSubmissionDatesResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.setLastSubmissionDate.setLastSubmissionDateApiResponse);
const selectGetLastSubmissionDatesResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.setLastSubmissionDate.getLastSubmissionDateApiResponse);
const selectUpdatedSubmissionDate = createSelector(selectAssessorState, (state: AssessorState) => state.pages.setLastSubmissionDate.submissionDate);

export const SetLastSubmissionDateSelectors = {
  selectSetLastSubmissionDatesResponse,
  selectGetLastSubmissionDatesResponse,
  selectUpdatedSubmissionDate
};

//         Return scheme to RP Selectors            //
//////////////////////////////////////////////////////
// Select the entire return to RP response object (RemoteData)
const selectReturnToRPResponse = createSelector(selectAssessorState, (state: AssessorState) => state.pages.returnToRP.data);
const selectReasonForReturningScheme = createSelector(selectAssessorState, (state: AssessorState) => state.pages.returnToRP.reasonForReturningScheme);

export const AssessorReturnToRPSelectors = {
  selectReturnToRPResponse,
  selectReasonForReturningScheme
};



//////////////////////////////////////////////////////
//               Exporting All Selectors            //
//////////////////////////////////////////////////////

export const AssessorSelectors = {
  AssessorSharedSelectors,
  AssessorDashboardSelectors,
  AssessorAuditRecommendationSelectors,
  AssessorConfirmRejectionSelectors,
  AssessorSubmitAssessmentReturnToRPSelectors,
  AssessorSchemeDetailsSelectors,
  AssessorSubmitAssessmentSelectors,
  SubmitReviewedCommentsSelectors,
  SetLastSubmissionDateSelectors,
  selectUpdatedSubmissionDate,
  AssessorReturnToRPSelectors
};
