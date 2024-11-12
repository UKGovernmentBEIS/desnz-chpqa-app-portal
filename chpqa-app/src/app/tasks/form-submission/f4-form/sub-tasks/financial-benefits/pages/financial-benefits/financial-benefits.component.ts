import { Component } from '@angular/core';
import { GovukCurrencyInputComponent } from '../../../../../../../shared/components/form-controls/govuk-currency-input/govuk-currency-input.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { positiveValueValidator } from '@shared/utils/validators-utils';
import { setFinancialBenefits } from 'src/app/tasks/form-submission/store';
import { selectFinancialBenefits } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { VALIDATIONS_FINANCIAL_BENEFITS_INPUTS } from '../../config/financial-benefits.validations';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-financial-benefits',
  standalone: true,
  templateUrl: './financial-benefits.component.html',
  styleUrl: './financial-benefits.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DynamicFormErrorsSummaryComponent,
    FormErrorDirective,
    GovukCurrencyInputComponent,
  ],
})
export class FinancialBenefitsComponent {
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  form: FormGroup;

  validationMessages = VALIDATIONS_FINANCIAL_BENEFITS_INPUTS;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store
  ) {
    this.form = this.fb.group({
      annualClimateChangeLevyAmount: [null, [positiveValueValidator(), Validators.required]],
      annualCarbonPriceSupportAmount: [null, [positiveValueValidator(), Validators.required]],
      annualRenewableHeatIncentiveUpliftAmount: [
        null,
        [positiveValueValidator()],
      ],
      annualRenewablesObligationCertificateAmount: [
        null,
        [positiveValueValidator()],
      ],
      annualContractsForDifferenceAmount: [null, [positiveValueValidator()]],
      annualBusinessRatesReductionAmount: [null, [positiveValueValidator()]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectFinancialBenefits)
      .pipe(first())
      .subscribe(financialBenefits => {
        this.form.patchValue(financialBenefits);
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setFinancialBenefits({ financialBenefits: this.form.getRawValue() })
      );
    }
  }
}
