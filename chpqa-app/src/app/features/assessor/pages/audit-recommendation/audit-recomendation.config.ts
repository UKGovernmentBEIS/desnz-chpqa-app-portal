export enum AssessorAuditRecommendationFormState {
  AssessorReasonsForAuditForm = 'AssessorReasonsForAuditForm',
  AssessorIsRecommendedForm = 'AssessorIsRecommendedForm',
}

export interface AuditIsRecommendedFormState {
  isRecommended: { value: boolean; label: string };
}

export interface ReasonsForAuditFormState {
  technicalPerformanceConcerns: boolean;
  complianceConcerns: boolean;
  comments: string;
}