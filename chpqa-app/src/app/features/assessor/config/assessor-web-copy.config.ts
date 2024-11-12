const auditRecommendationCopy = {
  screen1: {
    heading: 'Is this submission recommended for audit?',
    options: {
      yes: 'Yes',
      no: 'No',
    },
    additionalText: 'Visible only to assessors and auditors',
    instruction: 'ADD TWO checkboxes: Technical Performance concerns, Compliance concerns, Or both.',
    button: 'Continue',
  },
  screen2: {
    heading: 'What are your reasons for recommending an audit?',
    checkboxes: {
      technicalPerformanceConcerns: 'Technical performance concerns',
      complianceConcerns: 'Compliance concerns',
    },
    commentsText: 'Comments for audit recommendation (optional)',
    commentsNote: 'This will be communicated to the auditor',
    additionalText: 'You can enter up to 2000 characters',
    button: 'Continue',
  },
  screen3: {
    heading: 'Confirm your answers',
    question: 'Recommended for audit?',
    answer: 'Yes',
    changeText: 'Change',
  },
  screen4: {
    heading: 'Confirm your answers',
    details: {
      recommendedForAudit: {
        label: 'Recommended for audit?',
        value: 'Yes',
        changeText: 'Change',
      },
      reasonsForAudit: {
        label: 'Reasons for audit',
        value: 'Compliance concerns',
        changeText: 'Change',
      },
      commentsForAuditor: {
        label: 'Comments for the auditor',
        value: 'Comment comment comment',
        changeText: 'Change',
      },
    },
    button: 'Confirm and complete',
  },
};


export const submitAssessmentCopy = {
  screen1: {
    caption: "Submit assessment",
    heading: "You can now submit this assessment for validation",
    description: "When you submit this assessment, it will be sent to the next assessor for validation. The comments you have added to the assessment are grouped below.",
    subheading: "Your comments to the second assessor",
    comments: [
      { sectionName: 'Section name: comment', comment: 'Comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment comment comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment comment comment', changeText: 'Change' },
    ],
    button: 'Continue',
  },
  screen2: {
    caption: "Submit assessment",
    heading: "Select second assessor",
    dropdown: "Select second technical assessor",
    stickyNote: "RP comments collated prior to submission - auditor comments collated prior to submission to second assessor - RP comments to be collected per section, not as summary",
    button: "Submit assessment"
  },
  screen3: {
    caption: "Submit assessment",
    heading: "You have submitted this scheme for validation",
    description1: "What happens next",
    description2: "The scheme will now proceed to the second assessor for validation.",
    button: "Return to dashboard"
  }
};

export const returnSchemeCopy = {
  screen1: {
    caption: 'Submit assessment',
    heading: 'You can now return this scheme to the Responsible Person',
    description1: 'You can send this assessment back to the Responsible Person so they can address any queries or concerns you have raised.',
    description2: 'The comments that will be sent to them are grouped below. They will also receive an email containing these comments.',
    subheading: 'Your comments to the Responsible Person',
    comments: [
      { sectionName: 'Section name: comment', comment: 'Comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment comment comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment comment comment', changeText: 'Change' },
    ],
    button: 'Return scheme to RP',
  },
  screen2: {
    heading: 'You have returned this scheme to the Responsible Person',
    subheading: 'What happens next',
    description1: 'The Responsible Person will receive an email with your comments, and can then take further actions.',
    description2: 'Once the scheme has been resubmitted for assessment, we will notify you by email.',
    button: 'Return to dashboard',
  },
};

export const confirmRejectionCopy = {
  screen1: {
    caption: "Submit assessment",
    heading: "You can now submit this assessment to confirm rejection",
    description: "When you submit this assessment, it will be sent to the second assessor to confirm the rejection status. The comments you have added to the assessment are grouped below.",
    subheading: "Your comments to the second assessor",
    comments: [
      { sectionName: 'Section name: comment', comment: 'Comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment comment comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment', changeText: 'Change' },
      { sectionName: 'Section name: comment', comment: 'Comment comment comment', changeText: 'Change' },
    ],
    stickyNote:
      'RP comments collated prior to submission - auditor comments collated prior to submission to 2nd assessor - RP comments to be collected per section, not as summary',
    button: 'Continue',
  },
  screen2: {
    caption: "Submit assessment",
    heading: "Select second assessor",
    dropdown: "Select second technical assessor",
    button: "Submit assessment"
  },
  screen3: {
    caption: "Submit assessment",
    heading: "You have submitted this scheme to confirm rejection",
    description1: "What happens next",
    description2: "The scheme will now be sent to the second assessor.",
    button: "Return to dashboard"
  }
};

export const assessorDashboardWebCopy = {
  heading: 'Scheme list',
  description: 'You can see all your schemes here. Those that require actions from you are at the top of the list.',
  search: {
    label: 'Search for a scheme by name or reference',
    button: 'Search',
  },
  filtersToggle: {
    show: 'Show filters',
    hide: 'Hide filters',
  },
  filters: {
    header: 'Filter options',
    statusFilters: [
      'Approved',
      'Awaiting assessment',
      'Awaiting validation',
      'Certified',
      'In progress',
      'Rejected',
      'Returned for changes',
      'Returned for reassessment',
    ],
    assessorFilterLabel: 'Assessor',
    assessorFilter: 'Select technical assessor',
    submissionYearFilter: 'Select a submission year',
  },
  applyFiltersButton: 'Apply filters',
  clearFiltersButton: 'Clear Filters',
  schemeTable: {
    columns: ['Scheme', 'Scheme reference', 'Status', 'Assessor'],
  },
  pagination: {
    label: 'Page navigation',
  },
};

export const reviewCommentsWebCopy = {
  heading: 'comments',
  caption: 'Review assessor comments',
  button: 'Confirm and complete',
};

export const provideAssessmentDecisionReadyForCertificationWebCopy = {
  heading: 'Is the scheme ready for certification?',
  caption: 'Provide assessment decision',
  description1: "When the scheme is ready it can be certified.",
  description2: "You can also return it to the first assessor.",
  button: 'Continue and submit',
};

export const returnSchemeToRPWebCopy = {
  screen1: {
    heading: 'Return scheme to Responsible Person',
    caption: 'Return scheme to Responsible Person',
    description1: 'If needed, you can return this scheme to the RP to make changes or to answer queries.',
    description2: 'Explain why you are returning this scheme to the Responsible Person',
    button: 'Continue',
  },
  screen2: {
    heading: 'Check your answers',
    caption: 'Return scheme to Responsible Person',
    button: 'Confirm and complete',
  },
  screen3: {
    heading: 'Scheme returned to Responsible Person',
    description1: 'What happens next',
    description2: 'The Responsible Person will review your comments and make any required changes.',
    button: 'Return to dashboard'
  }
};




