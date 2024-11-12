import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { confirmDeletePrimeMover, selectPrimeMoverDeletionInformation } from '../../store';

@Component({
  selector: 'app-confirm-delete-prime-mover',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GovukRadioInputComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './confirm-delete-prime-mover.component.html',
  styleUrl: './confirm-delete-prime-mover.component.scss',
})
export class ConfirmDeletePrimeMoverComponent {

  primeMoverDeletionInformation$ = this.store.select(selectPrimeMoverDeletionInformation); 

  form: FormGroup;
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  validationMessages = {
    confirmDelete: {
      required: 'Select yes if you want to delete this prime mover',
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
      this.store.dispatch(confirmDeletePrimeMover(this.form.getRawValue()));
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
