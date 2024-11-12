import { FormGroup } from "@angular/forms";

export interface AssessorReviewDecisionForm {
  assessmentOutcome: number | null;
  changeNeededComment: string | null;
  sectionAssessmentComment: string | null;
}

export interface AssessorReviewDecisionFormSubmitData {
  formValue: AssessorReviewDecisionForm;
  reviewScreenName: string;
}

export interface AssessorReviewDecisionFormInfo {
  assessorForm: FormGroup;
  assessorFormUpdated: boolean
  assessorFormValidationMessages: any;
};