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
import { GovukNumberFormControlComponent } from '@shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { Store } from '@ngrx/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectMeterFiscal } from '../../store/meter.selectors';
import { setMeterFiscal } from '../../store/meter.actions';
import { first } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-meter-fiscal-check',
  standalone: true,
  templateUrl: './meter-fiscal-check.component.html',
  styleUrl: './meter-fiscal-check.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    FormErrorDirective,
    GovukNumberFormControlComponent,
    GovukRadioInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class MeterFiscalCheckComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.METER_EXISTENCE}`;
  form: FormGroup;

  validationMessages = {
    fiscal: {
      required: 'Select yes if this is your main meter',
    },
    fiscalPoint: {
      required: 'Enter your meter point reference number (MPRN)',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      fiscal: [null, [Validators.required]],
      fiscalPoint: [null, []],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectMeterFiscal)
      .pipe(first())
      .subscribe(fiscal => {
        this.form.patchValue(fiscal);
      });

    this.form.get('fiscal')?.valueChanges.subscribe(value => {
      const fiscalPointControl = this.form.get('fiscalPoint');
      if (value) {
        fiscalPointControl?.setValidators([Validators.required]);
      } else {
        fiscalPointControl?.clearValidators();
      }
      fiscalPointControl?.updateValueAndValidity();
    });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setMeterFiscal(this.form.getRawValue()));
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
