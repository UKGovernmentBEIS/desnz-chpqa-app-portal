import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import {
  selectRequestRocCertificate,
  setRequestRocCertificate,
} from '../../../store';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import * as SharedActions from '@shared/store/shared.action';
import { selectSubmissionFormId } from '@shared/store';

@Component({
  selector: 'app-request-roc-certificate',
  standalone: true,
  templateUrl: './request-roc-certificate.component.html',
  styleUrl: './request-roc-certificate.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    GovukRadioInputComponent,
    ReactiveFormsModule,
    FormErrorDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestRocCertificateComponent {
  BACK = `../${FormSubmissionPath.TASK_LIST}`;
  options: RadioButtonOption[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  form$: Observable<FormGroup> = this.store
    .select(selectRequestRocCertificate)
    .pipe(
      map((requestRocCertificate: boolean) => {
        const selectedOption = this.options.find(
          option => option.value === requestRocCertificate
        );
        return this.fb.group(
          {
            requestRocCertificate: [selectedOption, [Validators.required]],
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
      const requestRocCertificate =
        form.controls['requestRocCertificate'].value.value;
      this.store.dispatch(
        setRequestRocCertificate({
          requestRocCertificate,
        })
      );

      this.store.select(selectSubmissionFormId).pipe(take(1)).subscribe({
        next: submissionId => {
          this.store.dispatch(
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.ROC_CERTIFICATE_SUMMARY}`,
            })
          )
        }
      });
    }
  }
}
