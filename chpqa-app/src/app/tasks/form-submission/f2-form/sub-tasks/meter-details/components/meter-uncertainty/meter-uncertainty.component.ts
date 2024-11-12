import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { selectMeterUncertainty, setMeterUncertainty } from '../../store';
import { RouterModule } from '@angular/router';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { percentageValueValidator } from '@shared/utils/validators-utils';

@Component({
  selector: 'app-meter-uncertainty',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukUnitInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
  templateUrl: './meter-uncertainty.component.html',
  styleUrl: './meter-uncertainty.component.scss',
})
export class MeterUncertaintyComponent {
  form: FormGroup;
  validationMessages = {
    uncertainty: {
      required: 'Enter the uncertainty percentage',
      min: 'Enter a positive number for the percentage of uncertainty',
      percentageError:
        'The number for the percentage of uncertainty must be up to 100',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      uncertainty: [
        null,
        [Validators.required, Validators.min(0), percentageValueValidator()],
      ],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectMeterUncertainty)
      .pipe(first())
      .subscribe(uncertainty => {
        this.form.patchValue({
          uncertainty,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setMeterUncertainty(this.form.getRawValue()));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
