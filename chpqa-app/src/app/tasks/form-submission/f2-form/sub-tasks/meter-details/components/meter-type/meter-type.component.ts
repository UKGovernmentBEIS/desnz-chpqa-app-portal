import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { selectMeterType } from '../../store/meter.selectors';
import { OptionItem } from '@shared/models/option-item.model';
import { Store } from '@ngrx/store';
import { setMeterType } from '../../store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { EquipmentService } from '../../../../services/equipment.service';
import { first } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-meter-type',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
  templateUrl: './meter-type.component.html',
  styleUrl: './meter-type.component.scss',
})
export class MeterTypeComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.ADD_METER}`;
  form: FormGroup;
  subtypes$ = this.equipmentService.getMeterTypes();

  validationMessages = {
    meterType: {
      required: 'Select a meter type',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location,
    private readonly equipmentService: EquipmentService
  ) {
    this.form = this.fb.group({
      meterType: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectMeterType)
      .pipe(first())
      .subscribe((meterType: OptionItem) => {
        this.form.patchValue({
          meterType,
        });
      });
  }

  onContinue() {
    if (this.form.valid) {
      const meterType = {
        id: this.form.get('meterType')?.value.id,
        name: this.form.get('meterType')?.value.name,
      };
      this.store.dispatch(setMeterType({ meterType }));
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
