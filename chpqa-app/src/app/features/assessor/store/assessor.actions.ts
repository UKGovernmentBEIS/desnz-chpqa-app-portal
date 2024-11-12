import { createAction, props } from '@ngrx/store';
import { ReplyAssessCommentsTA1, ReplySubmDueDateConf, ReplySubmissionGroupCommentsTA1, RequestSubmDueDateConf } from 'src/app/api-services/chpqa-api/generated';
import { ReplyAuditRec } from 'src/app/api-services/chpqa-api/generated';
import { OptionItem } from '@shared/models/option-item.model';
import { ProvideAssessmentDecisionFormState } from '../pages/provide-assessment-decision/provide-assessment-decision.config';

//////////////////////////////////////////////////////
//                  Shared Actions               //
//////////////////////////////////////////////////////

const setFlagIsUserAnAssessor = createAction('[App Component] Set Flag Is User An Assessor', props<{ payload: boolean }>());

const loadSecondAssessorsList = createAction('[App Component] Load Second Assessors List', props<{ payload: any }>());

const loadSecondAssessorsListSuccess = createAction('[App Component] Load Second Assessors List Success', props<{ payload: OptionItem[] }>());

const loadSecondAssessorsListFailure = createAction('[App Component] Load Second Assessors List Failure', props<{ error: any }>());

const updateComments = createAction('[Assessor Comments] Update Comments', props<{ payload: ReplySubmissionGroupCommentsTA1[] }>());

const AssessorSharedActions = {
  setFlagIsUserAnAssessor,
  loadSecondAssessorsList,
  loadSecondAssessorsListSuccess,
  loadSecondAssessorsListFailure,
  updateComments
};

//////////////////////////////////////////////////////
//                  Dashboard Actions               //
//////////////////////////////////////////////////////

const loadAssessorDashboardData = createAction('[Assessor_AssessorDashboardComponent] Load Assessor Dashboard Data');
const loadAssessorDashboardDataSuccess = createAction(
  '[Assessor_AssessorDashboardComponent] Load Assessor Dashboard Data Success',
  props<{ payload: any }>()
);
const loadAssessorDashboardDataFailure = createAction(
  '[Assessor_AssessorDashboardComponent] Load Assessor Dashboard Data Failure',
  props<{ error: any }>()
);
const setSelectedAssessorSchemeId = createAction('[Assessor_AssessorDashboardComponent] Set Selected Assessor Scheme', props<{ schemeId: string }>());

const AssessorDashboardActions = {
  loadAssessorDashboardData,
  loadAssessorDashboardDataSuccess,
  loadAssessorDashboardDataFailure,
  setSelectedAssessorSchemeId,
};

//////////////////////////////////////////////////////
//      Set Last Submissions Date Actions           //
//////////////////////////////////////////////////////

const setLastSubmissionDate = createAction(
  '[Assessor_AssessorDashboardComponent] Set Last Submission Date',
  props<{ payload: RequestSubmDueDateConf}>()
);
const setLastSubmissionDateSuccess = createAction(
  '[Assessor_AssessorDashboardComponent] Set Last Submission Date Success',
);
const setLastSubmissionDateFailure = createAction(
  '[Assessor_AssessorDashboardComponent] Set Last Submission Date Failure',
  props<{ error: any }>()
);

const getLastSubmissionDate = createAction('[Assessor_AssessorDashboardComponent] Get Last Submission Date');
const getLastSubmissionDateSuccess = createAction(
  '[Assessor_AssessorDashboardComponent] Get Last Submission Date Success',
  props<{ payload: ReplySubmDueDateConf }>()
);
const getLastSubmissionDateFailure = createAction(
  '[Assessor_AssessorDashboardComponent] Get Last Submission Date Failure',
  props<{ error: any }>()
);

const updateSubmissionDate = createAction(
  '[Assessor_AssessorDashboardComponent] Update Submission Date',
  props<{ payload: any}>()
);

const SetLastSubmissionDateActions = {
  setLastSubmissionDate,
  setLastSubmissionDateSuccess,
  setLastSubmissionDateFailure,
  getLastSubmissionDate,
  getLastSubmissionDateSuccess,
  getLastSubmissionDateFailure,
  updateSubmissionDate
};

//////////////////////////////////////////////////////
//         Audit Recommendation Actions             //
//////////////////////////////////////////////////////

const loadAuditRecommendations = createAction('[Audit Recommendation] Load Recommendations');
const loadAuditRecommendationsSuccess = createAction('[Audit Recommendation] loadAuditRecommendationsSuccess', props<{ payload: ReplyAuditRec }>());
const loadAuditRecommendationsError = createAction(
  '[Audit Recommendation] loadAuditRecommendationsError',
  props<{ error: any }>() // Define error
);

const setAuditRecommendations = createAction('[Audit Recommendation] setAuditRecommendations');
const setAuditRecommendationsSuccess = createAction('[Audit Recommendation] setAuditRecommendationsSuccess');
const setAuditRecommendationsError = createAction(
  '[Audit Recommendation] setAuditRecommendationsError',
  props<{ error: any }>() // Define error
);

const AssessorAuditRecommendationActions = {
  loadAuditRecommendations,
  loadAuditRecommendationsSuccess,
  loadAuditRecommendationsError,

  setAuditRecommendations,
  setAuditRecommendationsSuccess,
  setAuditRecommendationsError,
};

//////////////////////////////////////////////////////
//           Confirm Rejection Actions              //
//////////////////////////////////////////////////////

const loadConfirmRejection = createAction('[Confirm Rejection] Load Rejection Details');
const confirmRejectionLoaded = createAction(
  '[Confirm Rejection] Rejection Details Loaded',
  props<{ payload: any }>() // Define payload
);
const confirmRejectionError = createAction(
  '[Confirm Rejection] Error',
  props<{ error: any }>() // Define error
);

const submitConfirmationRejection = createAction('[Confirm Rejection] Submit Rejection Details', props<{ secondAssessorId: string }>());
const submitConfirmationRejectionSuccess = createAction(
  '[Confirm Rejection] Submit Rejection Details Success',
  props<{ payload: any }>() // Define payload
);
const submitConfirmationRejectionError = createAction(
  '[Confirm Rejection] Error',
  props<{ error: any }>() // Define error
);

const AssessorConfirmRejectionActions = {
  loadConfirmRejection,
  confirmRejectionLoaded,
  confirmRejectionError,
  submitConfirmationRejection,
  submitConfirmationRejectionSuccess,
  submitConfirmationRejectionError,
};

//////////////////////////////////////////////////////
//            Return to RP Actions                  //
//////////////////////////////////////////////////////

const loadReturnToRP = createAction('[Return to RP] Load Return to RP Data');
const returnToRPLoaded = createAction(
  '[Return to RP] Return to RP Data Loaded',
  props<{ payload: any }>() // Define payload
);
const returnToRPError = createAction(
  '[Return to RP] Error',
  props<{ error: any }>() // Define error
);

const submitReturnToRP = createAction('[Return to RP] Submit Return to RP');
const submitReturnToRPSuccess = createAction(
  '[Return to RP] Submit Return to RP Success',
  props<{ payload: any }>() // Define payload
);
const submitReturnToRPError = createAction(
  '[Return to RP] Submit Return to RP Failure',
  props<{ error: any }>() // Define error
);

const AssessorSubmitAssessmentReturnToRPActions = {
  loadReturnToRP,
  returnToRPLoaded,
  returnToRPError,
  submitReturnToRP,
  submitReturnToRPSuccess,
  submitReturnToRPError,
};

//////////////////////////////////////////////////////
//           Scheme Details Actions                 //
//////////////////////////////////////////////////////

const loadSchemeDetails = createAction('[Scheme Details] Load Scheme Details');
const schemeDetailsLoaded = createAction(
  '[Scheme Details] Scheme Details Loaded',
  props<{ payload: any }>() // Define payload
);
const schemeDetailsError = createAction(
  '[Scheme Details] Error',
  props<{ error: any }>() // Define error
);

const AssessorSchemeDetailsActions = {
  loadSchemeDetails,
  schemeDetailsLoaded,
  schemeDetailsError,
};

//////////////////////////////////////////////////////
//           Submit Assessment Actions              //
//////////////////////////////////////////////////////

const loadSubmitAssessment = createAction('[Submit Assessment] Load Assessment Data', props<{ secondAssessorId: string }>());
const submitAssessmentLoaded = createAction(
  '[Submit Assessment] Assessment Data Loaded',
  props<{ id: string }>()
);
const submitAssessmentError = createAction(
  '[Submit Assessment] Error',
  props<{ error: any }>()
);

const AssessorSubmitAssessmentActions = {
  loadSubmitAssessment,
  submitAssessmentLoaded,
  submitAssessmentError,
};


//////////////////////////////////////////////////////
//           Provide Assessment Decision Actions              //
//////////////////////////////////////////////////////


const submitProvideAssessmentDecision = createAction(
  '[Provide Assessment Decision] submitProvideAssessmentDecision',
  props<{ payload: ProvideAssessmentDecisionFormState }>() // Define payload
);
const submitProvideAssessmentSuccess = createAction(
  '[Provide Assessment Decision] submitProvideAssessmentSuccess',
  props<{certifyChoice: boolean}>()
);

const AssessorProvideAssessmentDecisionActions = {
  submitProvideAssessmentDecision,
  submitProvideAssessmentSuccess,
};

//////////////////////////////////////////////////////
//           Submit Reviewed Comments Actions              //
//////////////////////////////////////////////////////

const submitReviewedComments = createAction(
  '[Review Comments] Submit Reviewed Comments'
);

const submitReviewedCommentsSuccess = createAction(
  '[Review Comments] Submit Reviewed Comments Success',
  props<{ payload: any }>()
);

const submitReviewedCommentsError = createAction(
  '[Review Comments] Submit Reviewed Comments Error',
  props<{ error: any }>()
);

const SubmitReviewedCommentsActions = {
  submitReviewedComments,
  submitReviewedCommentsSuccess,
  submitReviewedCommentsError,
};


//////////////////////////////////////////////////////
//           Return scheme to RP Actions            //
//////////////////////////////////////////////////////

const setReasonForReturningScheme = createAction(
  '[Return scheme to RP] Set Reason For Returning Scheme',
  props<{ reasonForReturningScheme: string }>() 
);

const loadReasonForReturningScheme = createAction(
  '[Return scheme to RP] Load Reason For Returning Scheme'
);

const loadReasonForReturningSchemeSuccess = createAction(
  '[Return scheme to RP] Load Reason For Returning Scheme Success',
  props<{ payload: any }>() 
);

const loadReasonForReturningSchemeError = createAction(
  '[Return scheme to RP] Load Reason For Returning Scheme Error',
  props<{ error: any }>() 
);

const confirmReturnSchemeToRP = createAction(
  '[Return scheme to RP] Confirm Return Scheme To RP'
);

const confirmReturnSchemeToRPSuccess = createAction(
  '[Return scheme to RP] Confirm Return Scheme To RP Success',
  props<{ payload: any }>() 
);

const confirmReturnSchemeToRPError = createAction(
  '[Return scheme to RP] Confirm Return Scheme To RP Error',
  props<{ error: any }>() 
);

const ReturnSchemeToRPActions = {
  setReasonForReturningScheme,
  confirmReturnSchemeToRP,
  confirmReturnSchemeToRPSuccess,
  confirmReturnSchemeToRPError,
  loadReasonForReturningScheme,
  loadReasonForReturningSchemeSuccess,
  loadReasonForReturningSchemeError
};
//////////////////////////////////////////////////////
//               Exporting All Actions              //
//////////////////////////////////////////////////////

export const AssessorActions = {
  AssessorSharedActions,
  AssessorDashboardActions,
  AssessorAuditRecommendationActions,
  AssessorConfirmRejectionActions,
  AssessorSubmitAssessmentReturnToRPActions,
  AssessorSchemeDetailsActions,
  AssessorSubmitAssessmentActions,
  AssessorProvideAssessmentDecisionActions,
  SubmitReviewedCommentsActions,
  SetLastSubmissionDateActions,
  ReturnSchemeToRPActions
};
