import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialBenefitsService {
  constructor(private route: ActivatedRoute) {}

  generateFinancialBenefitsFieldConfigs(selectFinancialBenefits: any, formInputs: any, sectionStatus: any): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId']; // Assuming 'submissionFormId' is another route param

    const inputLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.FINANCIAL_BENEFITS}`;

    return [
      {
        name: 'annualClimateChangeLevyAmount',
        label: 'Annual Climate Change Levy amount',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.annualClimateChangeLevyAmount ?? selectFinancialBenefits?.annualClimateChangeLevyAmount ?? '',
        ariaLabel: ChangeLinkAriaLabel.CLIMATE_CHANGE_LEVY_SUPPORT
      },
      {
        name: 'annualCarbonPriceSupportAmount',
        label: 'Annual Carbon Price Support amount',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.annualCarbonPriceSupportAmount ?? selectFinancialBenefits?.annualCarbonPriceSupportAmount ?? '',
        ariaLabel: ChangeLinkAriaLabel.ANNUAL_CARBON_PRICE_SUPPORT
      },
      {
        name: 'annualRenewableHeatIncentiveUpliftAmount',
        label: 'Annual Renewable Heat Incentive uplift amount',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.annualRenewableHeatIncentiveUpliftAmount ?? selectFinancialBenefits?.annualRenewableHeatIncentiveUpliftAmount ?? '',
        ariaLabel: ChangeLinkAriaLabel.ANNUAL_RENEWABLE_HEAT_INCENTIVE
      },
      {
        name: 'annualRenewablesObligationCertificateAmount',
        label: 'Annual Renewables Obligation Certificate amount',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.annualRenewablesObligationCertificateAmount ?? selectFinancialBenefits?.annualRenewablesObligationCertificateAmount ?? '',
        ariaLabel: ChangeLinkAriaLabel.ANNUAL_ROC
      },
      {
        name: 'annualContractsForDifferenceAmount',
        label: 'Annual Contracts for Difference amount',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.annualContractsForDifferenceAmount ?? selectFinancialBenefits?.annualContractsForDifferenceAmount ?? '',
        ariaLabel: ChangeLinkAriaLabel.ANNUAL_CFD
      },
      {
        name: 'annualBusinessRatesReductionAmount',
        label: 'Annual Business Rates Reduction amount',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: formInputs?.annualBusinessRatesReductionAmount ?? selectFinancialBenefits?.annualBusinessRatesReductionAmount ?? '',
        ariaLabel: ChangeLinkAriaLabel.ANNUAL_BUSINESS_RATES_REDUCTION
      },
    ];
  }
}
