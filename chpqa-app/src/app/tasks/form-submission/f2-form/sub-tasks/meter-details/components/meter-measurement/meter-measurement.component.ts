import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { selectMeterMeasurement, setMeterMeasurement } from '../../store';
import { combineLatest, first, forkJoin, map, of, switchMap } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { MeterFacade } from '../../store/meter.facade';
import { isComplex } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { MeasureType } from '@shared/enums/form-submission.enum';

@Component({
  selector: 'app-meter-measurement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GovukSelectInputComponent, GovukRadioInputComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './meter-measurement.component.html',
  styleUrl: './meter-measurement.component.scss',
})
export class MeterMeasurementComponent {
  form: FormGroup;
  measureOptions = [
    { label: 'Energy input', value: MeasureType.EnergyInput, hint: 'You have already added a meter in this category.', disabled: false },
    { label: 'Power output', value: MeasureType.PowerOutput, hint: 'You have already added a meter in this category.', disabled: false },
    { label: 'Heat output', value: MeasureType.HeatOutput, hint: 'You have already added a meter in this category.', disabled: false },
  ];

  validationMessages = {
    measureType: {
      required: 'Select what this meter will measure',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location,
    private meterFacade: MeterFacade
  ) {
    this.form = this.fb.group({
      measureType: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .pipe(
        select(isComplex),
        first(),
        switchMap(isComplex => {
          if (isComplex) {
            return combineLatest([this.store.select(selectMeterMeasurement).pipe(first()), of(this.measureOptions)]);
          } else {
            const measureTypeChecks = this.measureOptions.map(option =>
              this.meterFacade.hasMeasureType(option.value).pipe(
                map(exists => ({
                  ...option,
                  disabled: exists,
                }))
              )
            );
            return combineLatest([this.store.select(selectMeterMeasurement).pipe(first()), combineLatest(measureTypeChecks)]);
          }
        })
      )
      .subscribe(([measureType, updatedMeasureOptions]) => {
        this.measureOptions = updatedMeasureOptions;
        const selectedOption = this.measureOptions.find(option => option.value === measureType?.value);
        this.form.patchValue({
          measureType: selectedOption,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(setMeterMeasurement(this.form.getRawValue()));
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
