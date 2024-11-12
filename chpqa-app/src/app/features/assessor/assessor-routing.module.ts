import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { ASSESSOR_ROUTE_PATHS } from './config/assessor-routes.config';
import { AssessorAuditRecommendationConfirmYourAnswersComponent } from './pages/audit-recommendation/confirm-your-answers/assessor-audit-recommendation-confirm-your-answers.component';
import { AssessorAuditRecommendationIsForAuditComponent } from './pages/audit-recommendation/is-for-audit/assessor-audit-recommendation-is-for-audit.component';
import { AssessorAuditRecommendationReasonsForAuditComponent } from './pages/audit-recommendation/reasons-for-audit/assessor-audit-recommendation-reasons-for-audit.component';
import { AssessorFacade } from './store/assessor.facade';
import { AssessorProvideAssessmentDecisionReadyForCertificationComponent } from './pages/provide-assessment-decision/ready-for-certification/assessor-provide-assessment-decision-ready-for-certification.component';
import { AssessorProvideAssessmentDecisionReturnToFirstAssessorComponent } from './pages/provide-assessment-decision/return-to-first-assessor/assessor-provide-assessment-decision-return-to-first-assessor.component';
import { AssessorProvideAssessmentDecisionSchemeCertifiedComponent } from './pages/provide-assessment-decision/scheme-certified/assessor-provide-assessment-decision-scheme-certified.component';
import { canActivateReturnSchemeToRPPage } from './pages/return-scheme-to-rp/return-scheme-to-rp/return-scheme-to-rp.guard';

export const assessorRoutes: Routes = [
  {
    path: '',
    redirectTo: ASSESSOR_ROUTE_PATHS.dashboard,
    pathMatch: 'full',
  },
  {
    path: ASSESSOR_ROUTE_PATHS.dashboard,
    loadComponent: () => import('./pages/dashboard/assessor-dashboard.component').then(m => m.AssessorDashboardComponent),
  },
  {
    path: 'audit-recommendation',
    children: [
      {
        path: 'confirm-your-answers',
        component: AssessorAuditRecommendationConfirmYourAnswersComponent,
      },
      {
        path: 'is-for-audit',
        component: AssessorAuditRecommendationIsForAuditComponent,
      },
      {
        path: 'reasons-for-audit',
        component: AssessorAuditRecommendationReasonsForAuditComponent,
      },
    ],
    resolve: {
      data: () => {
        inject(AssessorFacade).auditRecommendationsFacade.dispatchActions.loadAuditRecommendations();
      }
    },
    data: {
      sectionId: SubmissionGroupType.ProvideAuditRecommendation, // groupType: 61
    },
  },
  {
    path: ASSESSOR_ROUTE_PATHS.confirmRejection.selectSecondAssessor,
    loadComponent: () =>
      import('./pages/confirm-rejection/select-second-assessor/assessor-confirm-rejection-select-second-assessor.component').then(
        m => m.AssessorConfirmRejectionSelectSecondAssessorComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.confirmRejection.submitToConfirmRejection,
    loadComponent: () =>
      import('./pages/confirm-rejection/submit-to-confirm-rejection/assessor-confirm-rejection-submit-to-confirm-rejection.component').then(
        m => m.AssessorSubmitToConfirmRejectionComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.confirmRejection.whatHappensNext,
    loadComponent: () =>
      import('./pages/confirm-rejection/what-happens-next/assessor-confirm-rejection-what-happens-next.component').then(
        m => m.AssessorConfirmRejectionWhatHappensNextComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.submitAssessmentReturnToRP.commentsToRP,
    loadComponent: () => import('./pages/submit-assessment-return-to-rp/comments-to-rp/assessor-return-to-rp-comments-to-rp.component').then(c => c.AssessorReturnToRPComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.submitAssessmentReturnToRP.whatHappensNext,
    loadComponent: () => import('./pages/submit-assessment-return-to-rp/what-happens-next/assessor-return-to-rp-what-happens-next.component').then(c => c.AssessorReturnToRPWhatHappensNextComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.schemeDetails,
    loadComponent: () => import('./pages/scheme-details/assessor-scheme-details.component').then(m => m.AssessorSchemeDetailsComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.submitAssessment.commentsToSecondAssessor,
    loadComponent: () =>
      import('./pages/submit-assessment/comments-to-second-assessor/assessor-submit-assessment-comments-to-second-assessor.component').then(
        m => m.AssessorSubmitAssessmentCommentsToSecondAssessorComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.submitAssessment.selectSecondAssessor,
    loadComponent: () =>
      import('./pages/submit-assessment/select-second-assessor/assessor-submit-assessment-select-second-assessor.component').then(
        m => m.AssessorSubmitAssessmentSelectSecondAssessorComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.submitAssessment.whatHappensNext,
    loadComponent: () =>
      import('./pages/submit-assessment/what-happens-next/assessor-submit-assessment-what-happens-next.component').then(
        m => m.AssessorSubmitAssessmentWhatHappensNextComponent
      ),
  },

  {
    path: ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.readyForCertification,
    component: AssessorProvideAssessmentDecisionReadyForCertificationComponent,
    data: {
      sectionId: SubmissionGroupType.ProvideAssessmentDecision,
    },
  },
  {
    path: ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.returnedToFirstAssessor,
    component: AssessorProvideAssessmentDecisionReturnToFirstAssessorComponent,
    data: {
      sectionId: SubmissionGroupType.ProvideAssessmentDecision,
    },
  },
  {
    path: ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.schemeCertified,
    component: AssessorProvideAssessmentDecisionSchemeCertifiedComponent,
    data: {
      sectionId: SubmissionGroupType.ProvideAssessmentDecision,
    },
  },
  {
    path: ASSESSOR_ROUTE_PATHS.assessorComments,
    loadComponent: () => import('./pages/review-comments/review-comments/review-comments.component').then(m => m.ReviewCommentsComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.checkYourAnswers,
    loadComponent: () => import('./pages/set-last-submissions-date/check-your-answers/assessor-set-last-submission-check-your-answers.component').then(m => m.AssessorSetLastSubmissionDateCheckYourAnswersComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.enterFinalDate,
    loadComponent: () => import('./pages/set-last-submissions-date/enter-final-date/assessor-set-last-submission-enter-final-date.component').then(m => m.AssessorSetLastSubmissionDateEnterFinalDateComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.whatHappensNext,
    loadComponent: () => import('./pages/set-last-submissions-date/what-happens-next/assessor-set-last-submission-what-happens-next.component').then(m => m.AssessorSetLastSubmissionDateWhatHappensNextComponent),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.returnToRP.reasonForReturningScheme,
    canActivate: [canActivateReturnSchemeToRPPage],
    loadComponent: () =>
      import('./pages/return-scheme-to-rp/return-scheme-to-rp/return-scheme-to-rp.component').then(
        m => m.ReturnSchemeToRpComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.returnToRP.summary,
    loadComponent: () =>
      import('./pages/return-scheme-to-rp/summary/summary.component').then(
        m => m.SummaryComponent
      ),
  },
  {
    path: ASSESSOR_ROUTE_PATHS.returnToRP.whatHappensNext,
    loadComponent: () =>
      import('./pages/return-scheme-to-rp/what-happens-next/what-happens-next.component').then(
        m => m.WhatHappensNextComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(assessorRoutes)],
  exports: [RouterModule],
})
export class AssessorRoutingModule {}
