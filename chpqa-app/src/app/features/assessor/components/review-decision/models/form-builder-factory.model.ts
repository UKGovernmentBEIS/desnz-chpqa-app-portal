import { FormGroup } from "@angular/forms";
import { Success } from "ngx-remotedata";
import { ReplySubmGroupDetails } from "src/app/api-services/chpqa-api/generated";

export interface FormBuilderFactory {
    buildReviewDecisionForm(): FormGroup;
    
    buildRadioButtonOptions(): any[];
    
    buildFormValidationMessages(): any;
    
    prefillFormWithStoredValues(
        form: FormGroup,
        radioButtonOptions: any[],
        reviewDecisionApiResponse: Success<ReplySubmGroupDetails>,
        reviewDecisionFormInputs: any,
    ): void;
}