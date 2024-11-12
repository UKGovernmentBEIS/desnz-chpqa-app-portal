import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { UnitService } from '@shared/services/unit.service';
import {
  selectPrimeMoverCustomUnit,
  selectPrimeMoverEngineManufacturer,
  selectPrimeMoverEngineManufacturerOther,
} from '../../store';
import {
  setCustomManufacturer,
  setNewCustomUnitStatus,
  setPrimeMoverEngineManufacturer,
} from '../../store/prime-mover.actions';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { combineLatest, first } from 'rxjs';
import { OtherOptionDirective } from '@shared/directives/other-option.directive';
import { GovukTextInputComponent } from '../../../../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-prime-mover-engine-manufacturer',
  standalone: true,
  templateUrl: './prime-mover-engine-manufacturer.component.html',
  styleUrl: './prime-mover-engine-manufacturer.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    OtherOptionDirective,
    GovukTextInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class PrimeMoverEngineManufacturerComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.PRIME_MOVER_ENGINE_SUBTYPE}`;
  form: FormGroup;
  manufacturers$ = this.unitService.getManufacturers();
  customUnit = false;

  validationMessages = {
    manufacturer: {
      required: 'Select a prime mover manufacturer',
    },
  };

  formUpdated = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location,
    private readonly unitService: UnitService
  ) {
    this.form = this.fb.group({
      manufacturer: [null, [Validators.required]],
      manufacturerOther: [null, []],
    });
  }

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectPrimeMoverEngineManufacturer),
      this.store.select(selectPrimeMoverEngineManufacturerOther),
      this.store.select(selectPrimeMoverCustomUnit),
    ])
      .pipe(first())
      .subscribe(([manufacturer, manufacturerOther, customUnit]) => {
        this.customUnit = customUnit;
        this.form.patchValue({
          manufacturer,
          manufacturerOther,
        });
      });

    this.form.get('manufacturer').valueChanges.subscribe(value => {
      this.customUnit = value.id === 'other';
    });
  }

  onContinue() {
    if (this.form.valid) {
      const manufacturer = {
        id: this.form.get('manufacturer')?.value.id,
        name: this.form.get('manufacturer')?.value.name,
      };

      if (this.customUnit) {
        this.store.dispatch(
          setCustomManufacturer({
            manufacturerOther: this.form.get('manufacturerOther').value,
          })
        );
        this.store.dispatch(setNewCustomUnitStatus({ customUnit: true }));
      } else {
        this.store.dispatch(setNewCustomUnitStatus({ customUnit: false }));
      }
      this.store.dispatch(setPrimeMoverEngineManufacturer({ manufacturer }));
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
