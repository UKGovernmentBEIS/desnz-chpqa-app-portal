import { Injectable } from "@angular/core";
import { SubmissionGroupType } from "@shared/enums/form-submission.enum";
import { ReplySubmissionGroups } from "src/app/api-services/chpqa-api/generated";
import { LightweightReviewDecisionFormService } from "./lightweight-review-decision-form.service";
import { ReviewDecisionFormService } from "./review-decision-form.service";
import { ReviewDecisionFormType } from "../enums/review-decision-form-type.enum";

@Injectable()
export class ReviewDecisionService {
    constructor(
      private lightweightReviewDecisionFormService: LightweightReviewDecisionFormService,
      private reviewDecisionFormService: ReviewDecisionFormService,
    ) { }

    getFormBuilder(formType: ReviewDecisionFormType) {
      switch (formType) {
        case ReviewDecisionFormType.Lightweight:
          return this.lightweightReviewDecisionFormService;
        case ReviewDecisionFormType.Normal:
          return this.reviewDecisionFormService;
        default:
          return this.reviewDecisionFormService;
      }
    }

    getFormType(submissionGroup: ReplySubmissionGroups) {
      const isSoSCertOrFinancialBenefits =
        submissionGroup?.groupType === SubmissionGroupType.SecretaryOfStateExemptionCertificate
        || submissionGroup?.groupType === SubmissionGroupType.ProvideInformationFinancialBenefits;
      
      return isSoSCertOrFinancialBenefits
        ? ReviewDecisionFormType.Lightweight
        : ReviewDecisionFormType.Normal
    };
}