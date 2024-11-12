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
import { Store, select } from '@ngrx/store';
import { UnitService } from '@shared/services/unit.service';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { Observable, combineLatest, first, of, switchMap } from 'rxjs';
import { Model } from '@shared/models/unit.model';
import {
  selectPrimeMoverCustomUnit,
  selectPrimeMoverEngineManufacturer,
  selectPrimeMoverEngineModel,
  selectPrimeMoverEngineModelOther,
} from '../../store';
import {
  setCustomModel,
  setPrimeMoverEngineModel,
} from '../../store/prime-mover.actions';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { GovukTextInputComponent } from '../../../../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { OtherOptionDirective } from '@shared/directives/other-option.directive';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-prime-mover-engine-model',
  standalone: true,
  templateUrl: './prime-mover-engine-model.component.html',
  styleUrl: './prime-mover-engine-model.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukSelectInputComponent,
    GovukTextInputComponent,
    OtherOptionDirective,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class PrimeMoverEngineModelComponent {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.PRIME_MOVER_ENGINE_MANUFACTURER}`;
  form: FormGroup;
  models$: Observable<Model[]>;
  customUnit = false;

  validationMessages = {
    model: {
      required: 'Select an engine model',
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
      model: [null, [Validators.required]],
      modelOther: [null, []],
    });
  }

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectPrimeMoverEngineModel),
      this.store.select(selectPrimeMoverEngineModelOther),
      this.store.select(selectPrimeMoverCustomUnit),
    ])
      .pipe(first())
      .subscribe(([model, modelOther, customUnit]) => {
        this.customUnit = customUnit;
        this.form.patchValue({
          model,
          modelOther,
        });
      });
    this.models$ = this.store.pipe(
      select(selectPrimeMoverEngineManufacturer),
      switchMap(manufacturer => {
        return this.unitService.getModels(manufacturer.id);
      })
    );

    this.form.get('model').valueChanges.subscribe(value => {
      this.customUnit = value.id === 'other';
    });
  }

  onContinue() {
    if (this.form.valid) {
      const model = {
        id: this.form.get('model')?.value.id,
        name: this.form.get('model')?.value.name,
      };
      if (this.customUnit) {
        this.store.dispatch(
          setCustomModel({ modelOther: this.form.get('modelOther').value })
        );
      }
      this.store.dispatch(setPrimeMoverEngineModel({ model }));
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
