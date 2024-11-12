import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { first } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectQualityIndexThreshold, setQualityIndexThreshold } from '../../../store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-quality-index-threshold',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GovukSelectInputComponent, GovukRadioInputComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './quality-index-threshold.component.html',
  styleUrl: './quality-index-threshold.component.scss',
})
export class QualityIndexThresholdComponent {
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  form: FormGroup;

  validationMessages = {
    qualityIndexThreshold: {
      required: 'Select the quality index threshold for your scheme’s assessment',
    },
  };
  formUpdated = false;

  qualityIndexThresholdOptions = [
    { label: 'Initial operation - 95 quality index', value: 95 },
    { label: 'Full operation - 100 quality index', value: 100 }, //TODO align with backend
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store
  ) {
    this.form = this.fb.group({
      qualityIndexThreshold: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectQualityIndexThreshold)
      .pipe(first())
      .subscribe(qualityIndexThreshold => {
        const selectedOption = this.qualityIndexThresholdOptions.find(option => option.value === qualityIndexThreshold?.value);
        if (selectedOption) {
          this.form.patchValue({ qualityIndexThreshold: selectedOption });
        }
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setQualityIndexThreshold(this.form.getRawValue()));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
