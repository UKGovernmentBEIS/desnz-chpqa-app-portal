import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Injectable } from "@angular/core";
import { ReplySubmGroupDetails } from "src/app/api-services/chpqa-api/generated";
import { FormBuilderFactory } from "../models/form-builder-factory.model";
import { Success } from "ngx-remotedata";

@Injectable({ providedIn: 'root' })
export class LightweightReviewDecisionFormService implements FormBuilderFactory {

    constructor(private fb: FormBuilder) { }

    buildReviewDecisionForm() {
        return this.fb.group({
            sectionAssessmentComment: new FormControl<string | null>(null),
        });
    }

    buildRadioButtonOptions() {
      return [];
    }

    buildFormValidationMessages() {
      return {};
    }

    prefillFormWithStoredValues(
      form: FormGroup,
      radioButtonOptions: any[],
      reviewDecisionApiResponse: Success<ReplySubmGroupDetails>,
      reviewDecisionFormInputs: any
    ) {
      const response: ReplySubmGroupDetails = reviewDecisionApiResponse?.value;

      form.patchValue({
        sectionAssessmentComment:
          reviewDecisionFormInputs?.sectionAssessmentComment
            ? reviewDecisionFormInputs?.sectionAssessmentComment
            : response?.sectionAssessmentComment,
      });
    }
}