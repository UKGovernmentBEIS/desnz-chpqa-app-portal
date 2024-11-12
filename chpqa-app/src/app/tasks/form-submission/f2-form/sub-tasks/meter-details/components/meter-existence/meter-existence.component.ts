import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { Store } from '@ngrx/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { setMeterExistingOrProposed } from '../../store/meter.actions';
import { selectMeterExistance } from '../../store/meter.selectors';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { first } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-meter-existence',
  standalone: true,
  templateUrl: './meter-existence.component.html',
  styleUrl: './meter-existence.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukRadioInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class MeterExistenceComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.METER_TYPE}`;
  form: FormGroup;
  options = [
    { label: 'Existing', value: true },
    { label: 'Proposed', value: false },
  ];

  validationMessages = {
    existingOrProposed: {
      required: 'Select if the meter is existing or proposed',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      existingOrProposed: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectMeterExistance)
      .pipe(first())
      .subscribe(existingOrProposed => {
        const selectedOption = this.options.find(
          option => option.value === existingOrProposed?.value
        );
        this.form.patchValue({
          existingOrProposed: selectedOption,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setMeterExistingOrProposed(this.form.getRawValue()));
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
