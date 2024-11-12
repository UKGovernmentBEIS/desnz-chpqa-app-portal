import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { combineLatest, distinctUntilChanged, first, min, switchMap, take, tap } from 'rxjs';
import { selectEnergyInput, selectEnergyInputIndex, updateEnergyInputs } from '../../../store';
import { OptionItem } from '@shared/models/option-item.model';
import { FuelService } from '../../../services/fuel.service';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { GovukMonthlyInputComponent } from '@shared/components/form-controls/govuk-monthly-input/govuk-monthly-input.component';
import { isComplex } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { Months } from '@shared/enums/months.enum';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReviewPerfomanceSummaryComponent } from '@shared/components/review-perfomance-summary/review-perfomance-summary.component';
import { PerformanceSummary } from '@shared/models/summary-lists';
import { selectIsSubmissionNonEditable } from '@shared/store';
import { mapPerformanceSummary } from '../../../utils/f4-form.utils';
import { ReplyFuelCategory } from 'src/app/api-services/chpqa-api/generated';

@Component({
  selector: 'app-enter-energy-input',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukUnitInputComponent,
    GovukRadioInputComponent,
    GovukMonthlyInputComponent,
    DynamicFormErrorsSummaryComponent,
    ReviewPerfomanceSummaryComponent,
  ],
  templateUrl: './enter-energy-input.component.html',
  styleUrl: './enter-energy-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterEnergyInputComponent {
  backButton = '../' + `${FormSubmissionPath.PROVIDE_ENERGY_INPUTS}`;
  form: FormGroup;
  fuelCategories$ = this.fuelService.getFuelCategories();
  fuelTypes: ReplyFuelCategory[] = [];
  energyInputName = '';
  energyInputIndex: number = null;
  energyInputMonths: { [key in Months]?: number } = {};
  isComplex$ = this.store.select(isComplex);
  includeCalculationsOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];
  formUpdated = false;
  validationMessages = {
    category: {
      required: 'Select a fuel category',
    },
    type: {
      required: 'Select a fuel type',
    },
    includeInCalculations: {
      required: 'Select yes if the meter will be included in CHPQA calculations',
    },
    annualTotal: {
      required: 'Enter annual total of energy inputs',
      min: 'Enter a positive value',
    },
    months: {
      month: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      january: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      february: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      march: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      april: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      may: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      june: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      july: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      august: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      september: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      october: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      november: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
      december: {
        required: 'Enter energy inputs for the month',
        min: 'Enter a positive value',
      },
    },
  };

  isSubmittedOrInReview: boolean;
  isComponentAlive = true;
  perfomanceSummary: PerformanceSummary;

  energyInputData$ = combineLatest([this.store.select(selectEnergyInput), this.isComplex$]);

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private readonly fuelService: FuelService
  ) {
    this.form = this.fb.group({
      id: [null],
      category: [null, [Validators.required]],
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

    this.energyInputData$.pipe(first()).subscribe(([energyInput, isComplex]) => {
      this.energyInputName = energyInput.tag;

      if (isComplex) {
        this.energyInputMonths = energyInput.months;
      }

      const selectedOption = this.includeCalculationsOptions.find(option => option.value === energyInput.includeInCalculations.value) ?? null;

      this.form.patchValue({
        id: energyInput.id,
        category: energyInput.category,
        type: energyInput?.type?.id && energyInput?.type?.name ? energyInput.type : null,
        includeInCalculations: selectedOption,
        annualTotal: energyInput.annualTotal,
      });
      if (this.isSubmittedOrInReview) {
        this.perfomanceSummary = mapPerformanceSummary(
          energyInput.tag,
          energyInput.serialNumber,
          energyInput.category.name,
          energyInput.type.name,
          energyInput.includeInCalculations.value as boolean,
          energyInput.annualTotal,
          this.backButton,
          energyInput.tfi
        );
      }
    });

    this.store
      .select(selectEnergyInputIndex)
      .pipe(first())
      .subscribe(energyInputIndex => {
        this.energyInputIndex = energyInputIndex;
      });

    this.form
      .get('category')
      ?.valueChanges.pipe(
        distinctUntilChanged(),
        switchMap(category => this.fuelService.getFuelTypeByCategoryId(category.id))
      )
      .subscribe(fuelTypes => {
        this.fuelTypes = fuelTypes;
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
        updateEnergyInputs({
          index: this.energyInputIndex,
          energyInput: this.form.getRawValue(),
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
