import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectCondensingSteamTurbine, setCondensingSteamTurbine } from '../../../store';
import { first, Subscription, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { DynamicFormErrorsSummaryComponent } from '../../../../../../shared/components/dynamic-form-builder/components/dynamic-form-errors-summary/dynamic-form-errors-summary.component';
import { GovukUnitInputComponent } from '../../../../../../shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { GovukNumberFormControlComponent } from '../../../../../../shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component';
import * as SharedActions from '@shared/store/shared.action';
import { selectSubmissionFormId } from '@shared/store';

@Component({
  selector: 'app-condensing-steam-turbine-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    GovukRadioInputComponent,
    DynamicFormErrorsSummaryComponent,
    GovukUnitInputComponent,
    GovukNumberFormControlComponent,
  ],
  templateUrl: './condensing-steam-turbine-details.component.html',
  styleUrl: './condensing-steam-turbine-details.component.scss',
})
export class CondensingSteamTurbineDetailsComponent {
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  form: FormGroup;
  formUpdated = false;

  zRatioDeterminedOptions = [
    { label: 'Yes', value: true },
    {
      label: 'No',
      value: false,
      inputConfig: {
        type: 'textarea',
        controlName: 'possibleToDetermineZRatio',
        label: 'Explain why it is not possible to determine the Z ration with plant trials',
        validationMessages: { required: 'Explain why you cannot determine the Z ratio with plant trials' },
        maxChars: 2000,
      },
    },
  ];

  validationMessages = {
    zRatioDetermined: {
      required: 'Select yes if the Z ratio of the scheme is determind by plant trials',
    },
    possibleToDetermineZRatio: {
      required: 'Explain why you cannot determine the Z ratio with plant trials',
    },
    steamExportPressure: {
      required: 'Select the steam export pressure',
    },
    steamTurbineSize: {
      required: 'Select the steam turbine size',
    },
    zRatio: {
      required: 'Enter the Z ratio of this scheme',
    },
  };

  private valueChangesSubscription: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store
  ) {
    this.form = this.fb.group({
      zRatioDetermined: [null, [Validators.required]],
      possibleToDetermineZRatio: [null, []],
      steamExportPressure: [null, [Validators.required]],
      steamTurbineSize: [null, [Validators.required]],
      zRatio: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectCondensingSteamTurbine)
      .pipe(first())
      .subscribe(condensingSteamTurbine => {
        const selectedZRatioDeterminedOption = this.zRatioDeterminedOptions.find(option => option.value === condensingSteamTurbine?.zRatioDetermined.value);
        this.form.patchValue({
          zRatioDetermined: selectedZRatioDeterminedOption,
          possibleToDetermineZRatio: condensingSteamTurbine?.possibleToDetermineZRatio,
          steamExportPressure: condensingSteamTurbine?.steamExportPressure,
          steamTurbineSize: condensingSteamTurbine?.steamTurbineSize,
          zRatio: condensingSteamTurbine?.zRatio,
        });
      });

    this.valueChangesSubscription = this.form.get('zRatioDetermined').valueChanges.subscribe(zRatioDetermined => {
      const possibleToDetermineZRatioControl = this.form.get('possibleToDetermineZRatio');
      if (zRatioDetermined.value === true) {
        possibleToDetermineZRatioControl.setValue(null);
        possibleToDetermineZRatioControl.clearValidators();
      } else {
        possibleToDetermineZRatioControl.setValidators([Validators.required]);
      }
      possibleToDetermineZRatioControl.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setCondensingSteamTurbine({ condensingSteamTurbine: this.form.getRawValue() }));
      this.store
        .select(selectSubmissionFormId)
        .pipe(take(1))
        .subscribe({
          next: submissionId => {
            this.store.dispatch(
              SharedActions.navigateTo({
                url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.CONDESING_STEAM_TURBINE_SUMMARY}`,
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
