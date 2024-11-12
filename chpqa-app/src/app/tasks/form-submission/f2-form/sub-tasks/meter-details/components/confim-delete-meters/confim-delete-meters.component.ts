import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule, Location } from '@angular/common';
import { selectMeterDeletionInformation, confirmDeleteMeter } from '../../store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';

@Component({
  selector: 'app-confim-delete-meters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GovukRadioInputComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './confim-delete-meters.component.html',
  styleUrl: './confim-delete-meters.component.scss'
})
export class ConfimDeleteMetersComponent {

  meterDeletionInformation$ = this.store.select(selectMeterDeletionInformation); 

  form: FormGroup;
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  validationMessages = {
    confirmDelete: {
      required: 'Select yes if you want to delete this meter',
    },
  };
  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      confirmDelete: [null, [Validators.required]],
    });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(confirmDeleteMeter(this.form.getRawValue()));
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
