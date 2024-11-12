import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { selectSubmissionFormId } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';
import { first, take } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { DynamicFormErrorsSummaryComponent } from '../../../../../../../shared/components/dynamic-form-builder/components/dynamic-form-errors-summary/dynamic-form-errors-summary.component';
import { WEB_COPY_ADJUSTMENT_FACTORS_INPUTS } from '../../config/uncertainty-factors.web-copy';
import { setUncertaintyFactorsValues } from '../../state/uncertainty-factors.actions';
import { UncertaintyFactorsSelectors } from '../../state/uncertainty-factors.selectors';

@Component({
  selector: 'app-adjustment-factors-inputs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormErrorDirective, GovukTextInputComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './adjustment-factors-inputs.component.html',
})
export class AdjustmentFactorsInputsComponent implements OnInit {
  webCopy = WEB_COPY_ADJUSTMENT_FACTORS_INPUTS;
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  form: FormGroup;
  formUpdated = false;

  validationMessages = {
    foi: {
      required: 'Enter Fuel Uncertainty Adjustment Factor FOI to 4 decimal places',
    },
    fop: {
      required: 'Enter Power Uncertainty Adjustment Factor FOP to 4 decimal places',
    },
    foh: {
      required: 'Enter Heat Uncertainty Adjustment Factor FOH to 4 decimal places',
    },
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store
  ) {
    this.form = this.fb.group({
      foi: [null, [Validators.required]],
      fop: [null, [Validators.required]],
      foh: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(UncertaintyFactorsSelectors.selectUncertaintyFactorsValues)
      .pipe(first())
      .subscribe(uncertaintyFactorsFormInputs => {
        this.form.patchValue({
          foi: uncertaintyFactorsFormInputs?.foi,
          fop: uncertaintyFactorsFormInputs?.fop,
          foh: uncertaintyFactorsFormInputs?.foh,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setUncertaintyFactorsValues({
          uncertaintyFactorsValues: this.form.getRawValue(),
        })
      );
      this.store
        .select(selectSubmissionFormId)
        .pipe(take(1))
        .subscribe({
          next: submissionId => {
            this.store.dispatch(
              SharedActions.navigateTo({
                url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_UPLOAD}`,
              })
            );
          },
        });
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
