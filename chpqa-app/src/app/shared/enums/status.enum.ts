export enum Status {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  CannotStartYet = 3,
  NotApplicable = 4,
}

export enum AssessorStatus {
  NotStarted = 0,
  Approved = 1,
  NeedsChange = 2,
  Rejected = 3,
  CannotStartYet = 4,
  Completed = 5,
  NotApplicable = 6,
}

export enum SubmissionStatus {
    NotStarted = 0,
    InProgress = 1,
    ReturnedForChanges = 2,
    DueForRenewal = 3,
    Submitted = 4,
    UnderReview = 5,
    Certified  = 6,
    NewMessage = 7,
    Rejected = 8,
    Expired = 9,
    Approved = 10,
    ReturnedForReassessment = 11,
    Unassinged = 12,
    ReturnToRPFromAA = 13,
}

export enum AssessmentOutcome {
  Approved = 0,
  NeedsChange = 1,
  Rejected = 2
}