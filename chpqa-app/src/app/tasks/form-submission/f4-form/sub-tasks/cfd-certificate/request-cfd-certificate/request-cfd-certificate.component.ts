import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectRequestCfdCertificate, setRequestCfdCertificate } from '../../../store';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import * as SharedActions from '@shared/store/shared.action';
import { selectSubmissionFormId } from '@shared/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-request-cfd-certificate',
  standalone: true,
  templateUrl: './request-cfd-certificate.component.html',
  styleUrl: './request-cfd-certificate.component.scss',
  imports: [CommonModule, RouterModule, GovukRadioInputComponent, ReactiveFormsModule, DynamicFormErrorsSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestCfdCertificateComponent {
  BACK = `../${FormSubmissionPath.TASK_LIST}`;
  formUpdated = false;

  validationMessages = {
    requestCfdCertificate: {
      required: 'Select yes if you would like a Contracts for Difference certificate',
    },
  };

  options: RadioButtonOption[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  form$: Observable<FormGroup> = this.store.select(selectRequestCfdCertificate).pipe(
    map((requestCfdCertificate: boolean) => {
      const selectedOption = this.options.find(option => option.value === requestCfdCertificate);
      return this.fb.group(
        {
          requestCfdCertificate: [selectedOption, [Validators.required]],
        },
        {
          updateOn: 'submit',
        }
      );
    })
  );

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  onSubmit(form: FormGroup) {
    if (form.valid) {
      const requestCfdCertificate = form.controls['requestCfdCertificate'].value.value;
      this.store.dispatch(
        setRequestCfdCertificate({
          requestCfdCertificate,
        })
      );
      this.store
        .select(selectSubmissionFormId)
        .pipe(take(1))
        .subscribe({
          next: submissionId => {
            this.store.dispatch(
              SharedActions.navigateTo({
                url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.CFD_CERTIFICATE_SUMMARY}`,
              })
            );
          },
        });
    } else {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
