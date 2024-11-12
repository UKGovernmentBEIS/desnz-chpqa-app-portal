export const ASSESSOR_ROUTE_PATHS = {
  assessor: 'assessor',
  dashboard: 'dashboard',
  auditRecommendation: {
    confirmYourAnswers: 'audit-recommendation/confirm-your-answers',
    isForAudit: 'audit-recommendation/is-for-audit',
    reasonsForAudit: 'audit-recommendation/reasons-for-audit',
  },
  confirmRejection: {
    selectSecondAssessor: 'confirm-rejection/select-second-assessor',
    submitToConfirmRejection: 'confirm-rejection/submit-to-confirm-rejection',
    whatHappensNext: 'confirm-rejection/what-happens-next',
  },
  submitAssessmentReturnToRP: {
    commentsToRP: 'return-to-rp/comments-to-rp',
    whatHappensNext: 'return-to-rp/what-happens-next',
  },
  schemeDetails: 'scheme-details',
  submitAssessment: {
    commentsToSecondAssessor: 'submit-assessment/comments-to-second-assessor',
    selectSecondAssessor: 'submit-assessment/select-second-assessor',
    whatHappensNext: 'submit-assessment/what-happens-next',
  },
  provideAssessmentDecision: {
    readyForCertification: 'provide-assessment-decision/ready-for-certification',
    returnedToFirstAssessor: 'provide-assessment-decision/returned-to-first-assessor',
    schemeCertified: 'provide-assessment-decision/scheme-certified',
  },
  assessorComments: 'review-assessor-comments',
  setLastSubmissionDate: {
    checkYourAnswers: 'set-last-submission-date/check-answers',
    enterFinalDate: 'set-last-submission-date/final-date',
    whatHappensNext: 'set-last-submission-date/what-happens-next',
  },
  returnToRP: {
    reasonForReturningScheme: 'return-to-rp/reason-for-returning-scheme',
    summary: 'return-to-rp/summary',
    whatHappensNext: 'return-to-rp/what-happens-next',
  },
};
