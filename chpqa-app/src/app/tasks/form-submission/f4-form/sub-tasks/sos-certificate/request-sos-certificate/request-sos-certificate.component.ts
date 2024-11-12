import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable, map, pipe, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import {
  selectRequestSoSCertificate,
  setRequestSoSCertificate,
} from '../../../store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { selectSubmissionFormId } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';

@Component({
  selector: 'app-request-sos-certificate',
  standalone: true,
  templateUrl: './request-sos-certificate.component.html',
  styleUrl: './request-sos-certificate.component.scss',
  imports: [
    RouterModule,
    GovukRadioInputComponent,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class RequestSoSCertificateComponent {
  BACK = `../${FormSubmissionPath.TASK_LIST}`;
  formUpdated = false;
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  validationMessages = {
    requestSoSCertificate: {
      required: 'Select yes if you would like a Secretary of State certificate',
    },
  };

  form$: Observable<FormGroup> = this.store
    .select(selectRequestSoSCertificate)
    .pipe(
      map((requestSoSCertificate: boolean) => {
        const selectedOption = this.options.find(
          option => option.value === requestSoSCertificate
        );
        return this.fb.group(
          {
            requestSoSCertificate: [selectedOption, [Validators.required]],
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
      const requestSoSCertificate =
        form.controls['requestSoSCertificate'].value.value;
      this.store.dispatch(
        setRequestSoSCertificate({
          requestSoSCertificate: requestSoSCertificate,
        })
      );

      this.store.select(selectSubmissionFormId).pipe(take(1)).subscribe({
        next: submissionId => {
          this.store.dispatch(
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE_SUMMARY}`,
            })
          )
        }
      });
    } else {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
