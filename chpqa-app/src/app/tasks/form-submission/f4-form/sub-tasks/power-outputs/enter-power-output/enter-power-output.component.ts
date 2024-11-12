import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { selectPowerOutput, selectPowerOutputIndex } from '../../../store/f4-form.selectors';
import { combineLatest, first, take, tap } from 'rxjs';
import { updatePowerOutputs } from '../../../store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { OptionItem } from '@shared/models/option-item.model';
import { PowerType } from '../../../models/f4-form.model';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { GovukMonthlyInputComponent } from '@shared/components/form-controls/govuk-monthly-input/govuk-monthly-input.component';
import { Months } from '@shared/enums/months.enum';
import { isComplex } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { selectIsSubmissionNonEditable } from '@shared/store';
import { PerformanceSummary } from '@shared/models/summary-lists';
import { mapPerformanceSummary } from '../../../utils/f4-form.utils';
import { ReviewPerfomanceSummaryComponent } from '../../../../../../shared/components/review-perfomance-summary/review-perfomance-summary.component';

@Component({
  selector: 'app-enter-power-output',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukUnitInputComponent,
    GovukRadioInputComponent,
    GovukMonthlyInputComponent,
    DynamicFormErrorsSummaryComponent,
    ReviewPerfomanceSummaryComponent,
  ],
  templateUrl: './enter-power-output.component.html',
  styleUrl: './enter-power-output.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterPowerOutputComponent {
  backButton = '../' + `${FormSubmissionPath.PROVIDE_POWER_OUTPUTS}`;
  form: FormGroup;
  powerOutputName = '';
  powerOutputIndex: number = null;
  powerOutputMonths: { [key in Months]?: number } = {};
  powerTypes: OptionItem[] = [
    { id: PowerType.Generated.toString(), name: 'Generated' },
    { id: PowerType.Exported.toString(), name: 'Exported' },
    { id: PowerType.Imported.toString(), name: 'Imported' },
  ];
  isComplex$ = this.store.pipe(select(isComplex));
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];
  formUpdated = false;
  validationMessages = {
    type: {
      required: 'Select a power type',
    },
    includeInCalculations: {
      required: 'Select yes if the meter will be included in CHPQA calculations',
    },
    annualTotal: {
      required: 'Enter annual total of power outputs',
      min: 'Enter a positive value',
    },
    months: {
      month: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      january: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      february: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      march: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      april: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      may: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      june: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      july: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      august: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      september: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      october: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      november: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
      december: {
        required: 'Enter power outputs for the month',
        min: 'Enter a positive value',
      },
    },
  };

  isSubmittedOrInReview: boolean;
  isComponentAlive = true;
  perfomanceSummary: PerformanceSummary;

  powerOutputData$ = combineLatest([this.store.select(selectPowerOutput), this.isComplex$]);

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id: [null, [Validators.required]],
      type: [null, [Validators.required]],
      includeInCalculations: [null, [Validators.required]],
      annualTotal: [null],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectIsSubmissionNonEditable)
      .pipe(take(1))
      .subscribe(nonEditable => {
        this.isSubmittedOrInReview = nonEditable;
      });

    this.powerOutputData$.pipe(first()).subscribe(([powerOutput, isComplex]) => {
      this.powerOutputName = powerOutput.tag;

      if (isComplex) {
        this.powerOutputMonths = powerOutput.months;
      }

      const selectedOption = this.options.find(option => option.value === powerOutput.includeInCalculations.value);
      this.form.patchValue({
        id: powerOutput.id,
        type: powerOutput.type,
        includeInCalculations: selectedOption,
        annualTotal: powerOutput.annualTotal,
      });
      if (this.isSubmittedOrInReview) {
        this.perfomanceSummary = mapPerformanceSummary(
          powerOutput.tag,
          powerOutput.serialNumber,
          powerOutput.category.name,
          powerOutput.type.name,
          powerOutput.includeInCalculations.value as boolean,
          powerOutput.annualTotal,
          this.backButton
        );
      }
    });

    this.store
      .select(selectPowerOutputIndex)
      .pipe(first())
      .subscribe(powerOutputIndex => {
        this.powerOutputIndex = powerOutputIndex;
      });

    this.isComplex$.pipe(tap(isComplex => this.updateAnnualTotalValidators(isComplex))).subscribe();
  }

  navigateBack() {
    this.router.navigate([this.backButton], {
      relativeTo: this.route,
    });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        updatePowerOutputs({
          index: this.powerOutputIndex,
          powerOutput: this.form.getRawValue(),
        })
      );
      this.navigateBack();
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  private updateAnnualTotalValidators(isComplex: boolean): void {
    if (isComplex) {
      this.form.controls.annualTotal.clearValidators();
    } else {
      this.form.controls.annualTotal.setValidators([Validators.required, Validators.min(0)]);
    }
    this.form.controls.annualTotal.updateValueAndValidity();
  }
}
