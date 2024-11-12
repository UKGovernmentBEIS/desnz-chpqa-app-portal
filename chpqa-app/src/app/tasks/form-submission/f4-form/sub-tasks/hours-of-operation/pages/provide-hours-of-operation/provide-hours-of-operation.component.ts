import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { GovukNumberFormControlComponent } from '@shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectHoursOfOperation } from '../../../../store/f4-form.selectors';
import { first, take } from 'rxjs';
import { setHoursOfOperation } from '../../../../store/f4-form.actions';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { HoursOfOperationDataModel } from '../../../../models/f4-form.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { FormStateSyncDirective } from '@shared/directives/form-state-sync.directive';
import { HoursOfOperationSharedStateFormEnum } from '../../config/hours-of-operation.config';
import * as SharedActions from '@shared/store/shared.action';
import { selectSubmissionFormId } from '@shared/store';

@Component({
  selector: 'app-provide-hours-of-operation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GovukNumberFormControlComponent, DynamicFormErrorsSummaryComponent, FormStateSyncDirective],
  templateUrl: './provide-hours-of-operation.component.html',
  styleUrl: './provide-hours-of-operation.component.scss',
})
export class ProvideHoursOfOperationComponent {
  BACK = `../` + FormSubmissionPath.TASK_LIST;
  form: FormGroup;
  formUpdated = false;
  SubmissionFormType = SubmissionFormType;

  validationMessages = {
    hoursOfOperation: {
      required: 'Enter the total hours of operation',
      min: 'Enter a positive value',
    },
    months: {
      required: 'Enter how many months the period covers',
      min: 'Enter a positive value',
    },
  };

  submissionFormType$ = this.store.select(selectFormSubmissionType);

  HoursOfOperationSharedStateFormEnum = HoursOfOperationSharedStateFormEnum;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store
  ) {
    this.form = this.fb.group({
      hoursOfOperation: [null, [Validators.required, Validators.min(0)]],
      months: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectHoursOfOperation)
      .pipe(first())
      .subscribe(hoursOfOperation => {
        this.form.patchValue({
          hoursOfOperation: hoursOfOperation?.hoursOfOperation,
          months: hoursOfOperation?.months,
        });
      });

    this.submissionFormType$.pipe(take(1)).subscribe(submissionFormType => {
      if (submissionFormType === SubmissionFormType.F4) {
        this.form.get('months').setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.form.get('months').clearValidators();
      }
      this.form.get('months').updateValueAndValidity();
    });
  }

  onContinue() {
    if (this.form.valid) {
      const hoursOfOperation = {
        hoursOfOperation: this.form.get('hoursOfOperation')?.value,
        months: this.form?.get('months')?.value,
      } as HoursOfOperationDataModel;
      this.store.dispatch(setHoursOfOperation({ payload: hoursOfOperation }));
      this.store.select(selectSubmissionFormId).pipe(take(1)).subscribe({
        next: submissionId => {
          this.store.dispatch(
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION_SUMMARY}`,
            })
          )
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
