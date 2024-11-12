import { Component } from '@angular/core';
import { GovukTextInputComponent } from '../../../../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  selectPrimeMoverEngineMetrics,
  setPrimeMoverEngineMetrics,
  submitNewCustomInit,
} from '../../store';
import { first } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukNumberFormControlComponent } from "../../../../../../../shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component";

@Component({
  selector: 'app-prime-mover-figures',
  standalone: true,
  templateUrl: './prime-mover-figures.component.html',
  styleUrl: './prime-mover-figures.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    GovukUnitInputComponent,
    DynamicFormErrorsSummaryComponent,
    GovukNumberFormControlComponent
],
})
export class PrimeMoverFiguresComponent {
  form: FormGroup;

  validationMessages = {
    totalHeatOutputKw: {
      required: 'Enter the total heat output',
      min: 'Enter a positive value',
    },
    totalPowerCapacityKw: {
      required: 'Enter the total power capacity',
      min: 'Enter a positive value',
    },
    fuelInputKw: {
      required: 'Enter the fuel input',
      min: 'Enter a positive value',
    },
    powerEfficiency: {
      required: 'Enter the power efficiency',
      min: 'Enter a positive value',
    },
    maxHeatToPowerRatio: {
      required: 'Enter the max heat to power ratio',
      min: 'Enter a positive value',
    },
    maxHeatEfficiency: {
      required: 'Enter the max heat efficiency',
      min: 'Enter a positive value',
    },
    maxOverallEfficiency: {
      required: 'Enter the max overall efficiency',
      min: 'Enter a positive value',
    },
  };

  formUpdated = false;

  constructor(
    private fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      totalHeatOutputKw: [null, [Validators.required, Validators.min(0)]],
      totalPowerCapacityKw: [null, [Validators.required, Validators.min(0)]],
      fuelInputKw: [null, [Validators.required, Validators.min(0)]],
      powerEfficiency: [null, [Validators.required, Validators.min(0)]],
      maxHeatToPowerRatio: [null, [Validators.required, Validators.min(0)]],
      maxHeatEfficiency: [null, [Validators.required, Validators.min(0)]],
      maxOverallEfficiency: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectPrimeMoverEngineMetrics)
      .pipe(first())
      .subscribe(engineMetrics => {
        this.form.patchValue({
          engineMetrics,
        });
      });
  }

  goBack(): void {
    this.location.back();
  }
  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setPrimeMoverEngineMetrics({ engine: this.form.getRawValue() })
      );
      this.store.dispatch(
        submitNewCustomInit({ engine: this.form.getRawValue() })
      );
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
