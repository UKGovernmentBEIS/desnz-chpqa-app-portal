import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { FinancialBenefitsData } from '@shared/models/form-submission.model';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

export interface FinancialBenefitsRequest {
  annualClimateChangeLevyAmount?: number;
  annualCarbonPriceSupportAmount?: number;
  annualRenewableHeatIncentiveUpliftAmount?: number;
  annualRenewablesObligationCertificateAmount?: number;
  annualContractsForDifferenceAmount?: number;
  annualBusinessRatesReductionAmount?: number;
}

export interface FinancialBenefitsSubmissionRequest
  extends FinancialBenefitsRequest {
  idSubmission: string;
  idGroup: string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialBenefitsService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  create(
    submissionFormId: string,
    groupId: string,
    financialBenefits: FinancialBenefitsData
  ) {
    const financialBenefitsSubmissionRequest: any =
      {
        idSubmission: submissionFormId,
        annualClimateChangeLevyAmount: financialBenefits.annualClimateChangeLevyAmount,
        annualCarbonPriceSupportAmount: financialBenefits.annualCarbonPriceSupportAmount,
        annualRenewableHeatIncentiveUpliftAmount:
          financialBenefits.annualRenewableHeatIncentiveUpliftAmount,
        annualRenewablesObligationCertificateAmount:
          financialBenefits.annualRenewablesObligationCertificateAmount,
        annualContractsForDifferenceAmount:
          financialBenefits.annualContractsForDifferenceAmount,
        annualBusinessRatesReductionAmount:
          financialBenefits.annualBusinessRatesReductionAmount,
      };
      return this.chqpaApiServiceWrapper.updSubmFinancialBenefitsService.apiSecureUpdSubmFinancialBenefitsPost(financialBenefitsSubmissionRequest);
  }
}
