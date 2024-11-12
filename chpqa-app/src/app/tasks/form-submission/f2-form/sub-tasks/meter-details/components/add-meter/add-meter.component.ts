import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { GovukNumberFormControlComponent } from '@shared/components/form-controls/govuk-number-input/gov-uk-number-form-control.component';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { Store, select } from '@ngrx/store';
import { YearSelectDirective } from '@shared/directives/year-select.directive';
import { selectMeterDetails } from '../../store/meter.selectors';
import { setMeterDetails } from '../../store/meter.actions';
import { first, take } from 'rxjs';
import { selectSubmissionFormId } from '@shared/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukTextInputComponent } from "../../../../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component";
import { MeterFacade } from '../../store/meter.facade';

@Component({
  selector: 'app-add-meter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukNumberFormControlComponent,
    YearSelectDirective,
    DynamicFormErrorsSummaryComponent,
    GovukTextInputComponent
],
  templateUrl: './add-meter.component.html',
  styleUrl: './add-meter.component.scss',
})
export class AddMeterComponent implements OnInit {
  submissionId = '';
  form: FormGroup;

  validationMessages = {
    tagNumber: {
      required: 'Enter a tag number',
      pattern: 'Enter a positive integer number',
    },
    serialNumber: {
      required: 'Enter a serial number',
    },
    yearInstall: {
      required: 'Select a year',
    },
  };

  formUpdated = false;

  meterName$ = this.meterFacade.getMeterName();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location,
    private meterFacade: MeterFacade
  ) {
    this.form = this.fb.group({
      tagNumber: [null, [Validators.required]],
      serialNumber: [null, [Validators.required]],
      yearInstall: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectMeterDetails)
      .pipe(first())
      .subscribe(meterDetails => {
        this.form.patchValue({
          tagNumber: meterDetails.tagNumber,
          serialNumber: meterDetails.serialNumber,
          yearInstall: meterDetails.yearInstalled,
        });
      });
    this.store.pipe(select(selectSubmissionFormId), take(1)).subscribe(id => {
      this.submissionId = id;
    });
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setMeterDetails({
          tagNumber: this.form.get('tagNumber')?.value,
          serialNumber: this.form.get('serialNumber')?.value,
          yearInstalled: this.form.get('yearInstall')?.value,
        })
      );
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
