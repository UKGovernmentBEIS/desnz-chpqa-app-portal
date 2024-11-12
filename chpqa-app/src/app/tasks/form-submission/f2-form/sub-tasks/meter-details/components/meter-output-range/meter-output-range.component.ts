import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription, combineLatest, distinctUntilChanged, first } from 'rxjs';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { OtherOptionDirective } from '@shared/directives/other-option.directive';
import { rangeValidator } from '@shared/utils/validators-utils';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { GovukUnitInputComponent } from '@shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import {
  selectMeterOutput,
  selectMeterOutputOther,
} from '../../store/meter.selectors';
import {
  setMeterCustomOutputUnit,
  setMeterOutput,
} from '../../store/meter.actions';
import { OutputUnitService } from '../../../../services/output-unit.service';
import { GovukNumberFormControlComponent } from '../../../../../../../shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-meter-output-range',
  standalone: true,
  templateUrl: './meter-output-range.component.html',
  styleUrl: './meter-output-range.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukUnitInputComponent,
    OtherOptionDirective,
    GovukNumberFormControlComponent,
    GovukTextInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class MeterOutputRangeComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.METER_FISCAL_CHECK}`;
  form: FormGroup;

  outputUnits$ = this.outputUnitService.fetchOutputUnits();
  customOutputUnit = false;

  private subscriptions: Subscription = new Subscription();

  validationMessages = {
    outputRangeMin: {
      required: 'Enter the minimum flow rate',
      min: 'Enter a positive value',
      rangeError: 'The minimum flow rate cannot be more than the maximum',
    },
    outputRangeMax: {
      required: 'Enter the maximum flow rate',
      min: 'Enter a positive value',
      rangeError: 'The maximum flow rate cannot be less than the minimum',
    },
    outputUnit: {
      required: 'Enter the output units',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location,
    private readonly outputUnitService: OutputUnitService
  ) {
    this.form = this.fb.group(
      {
        outputRangeMin: [null, [Validators.required, Validators.min(0)]],
        outputRangeMax: [null, [Validators.required, Validators.min(0)]],
        outputUnit: [null, [Validators.required]],
        outputUnitOther: [null],
      },
      { validator: rangeValidator('outputRangeMin', 'outputRangeMax') }
    );
  }

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectMeterOutput),
      this.store.select(selectMeterOutputOther),
    ])
      .pipe(first())
      .subscribe(([output, outputUnitOther]) => {
        if (outputUnitOther) {
          this.customOutputUnit = true;
        }
        this.form.patchValue({
          outputRangeMin: output.outputRangeMin,
          outputRangeMax: output.outputRangeMax,
          outputUnit: output.outputUnit,
          outputUnitOther: outputUnitOther,
        });
      });

    this.subscriptions.add(
      this.form
        .get('outputUnit')
        .valueChanges.pipe(distinctUntilChanged())
        .subscribe(value => {
          this.customOutputUnit = value.id === 'other';
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onContinue() {
    if (this.form.valid) {
      const output = {
        outputRangeMin: this.form.get('outputRangeMin')?.value,
        outputRangeMax: this.form.get('outputRangeMax')?.value,
        outputUnit: this.form.get('outputUnit')?.value,
      };
      if (this.customOutputUnit) {
        this.store.dispatch(
          setMeterCustomOutputUnit({
            outputUnitOther: this.form.get('outputUnitOther').value,
          })
        );
      }

      this.store.dispatch(setMeterOutput(output));
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
