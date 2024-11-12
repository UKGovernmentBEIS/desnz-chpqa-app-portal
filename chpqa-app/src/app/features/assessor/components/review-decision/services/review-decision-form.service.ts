import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Injectable } from "@angular/core";
import { ReplySubmGroupDetails } from "src/app/api-services/chpqa-api/generated";
import { FormBuilderFactory } from "../models/form-builder-factory.model";

@Injectable({ providedIn: 'root' })
export class ReviewDecisionFormService implements FormBuilderFactory {

    constructor(private fb: FormBuilder) { }

    buildReviewDecisionForm() {
      return this.fb.group({
          assessmentOutcome: new FormControl<number | null>(null, Validators.required),
          changeNeededComment: new FormControl<string | null>(null),
          sectionAssessmentComment: new FormControl<string | null>(null),
      });
    }

    buildRadioButtonOptions() {
      return [
        { label: 'Approved', value: 0 },
        {
          label: 'Return for changes or raise query',
          value: 1,
          inputConfig: {
            type: 'textarea',
            controlName: 'changeNeededComment',
            label: 'Your requested changes or questions',
            description: 'This will be communicated to the Responsible Person',
            maxChars: 200,
            validationMessages: {
              required: 'Enter your changes or questions about the RP or site contact',
            }
          },
        },
        { label: 'Rejected', value: 2 },
      ];
    }

    buildFormValidationMessages() {
      return {
        assessmentOutcome: {
          required: 'Select approved if the diagram meets your requirements',
        },
        changeNeededComment: {
          required: 'Enter your changes or questions about the RP or site contact'
        }
      };
    }

    prefillFormWithStoredValues(
      form: FormGroup,
      radioButtonOptions: any[],
      reviewDecisionApiResponse: any,
      reviewDecisionFormInputs: any,
    ) {
      const response: ReplySubmGroupDetails = reviewDecisionApiResponse?.value;
      
      let valueToFind = reviewDecisionFormInputs?.assessmentOutcome
        ? reviewDecisionFormInputs?.assessmentOutcome
        : response?.assessmentOutcome;
      
      const selectedOption = radioButtonOptions?.find(
        option => option.value === valueToFind
      );

      form.patchValue({
        assessmentOutcome: selectedOption,
        changeNeededComment:
          reviewDecisionFormInputs?.changeNeededComment
            ? reviewDecisionFormInputs?.changeNeededComment
            : response?.changeNeededComment,
        sectionAssessmentComment:
          reviewDecisionFormInputs?.sectionAssessmentComment
            ? reviewDecisionFormInputs?.sectionAssessmentComment
            : response?.sectionAssessmentComment,
      });
    }
}