import { Component } from '@angular/core';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { first, take } from 'rxjs';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import {
  f2FormFeature,
  setTotalPowerCapacityUnderMaxHeat,
} from '../../../../store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { RouterModule } from '@angular/router';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { selectSubmissionFormId } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';

@Component({
  selector: 'app-set-total-power-capacity-under-maxheat',
  standalone: true,
  templateUrl: './set-total-power-capacity-under-maxheat.component.html',
  styleUrl: './set-total-power-capacity-under-maxheat.component.scss',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, GovukTextInputComponent, GovukUnitInputComponent, DynamicFormErrorsSummaryComponent],
})
export class SetTotalPowerCapacityUnderMaxHeatComponent {
  form: FormGroup;
  BACK = '../' + `${FormSubmissionPath.TASK_LIST}`;
  formUpdated = false;

  validationMessages = {
    totalPowerCapacityUnderMaxHeat: {
      required: 'Enter the total power capacity under MaxHeat conditions',
      min: 'Enter a positive value',
    },
  };

  constructor(
    private fb: FormBuilder,
    private readonly store: Store
  ) {
    this.form = this.fb.group({
      totalPowerCapacityUnderMaxHeat: [null, [Validators.required,Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(f2FormFeature.selectTotalPowerCapacityUnderMaxHeat)
      .pipe(first())
      .subscribe(totalPowerCapacityUnderMaxHeat => {
        this.form.patchValue({
          totalPowerCapacityUnderMaxHeat,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setTotalPowerCapacityUnderMaxHeat({
          totalPowerCapacityUnderMaxHeat: this.form.get('totalPowerCapacityUnderMaxHeat').value as number,
        })
      );

      this.store.select(selectSubmissionFormId).pipe(take(1)).subscribe({
        next: submissionId => {
          this.store.dispatch(
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS_SUMMARY}`,
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
