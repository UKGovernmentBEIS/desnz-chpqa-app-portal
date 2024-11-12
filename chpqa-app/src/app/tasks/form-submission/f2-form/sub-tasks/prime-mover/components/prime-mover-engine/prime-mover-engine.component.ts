import { Component } from '@angular/core';
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
import { Observable, combineLatest, first, switchMap } from 'rxjs';
import { Engine } from '@shared/models/unit.model';
import {
  selectPrimeMoverCustomUnit,
  selectPrimeMoverEngineModel,
  selectPrimeMoverEngineName,
  selectPrimeMoverEngineOther,
} from '../../store';
import {
  getEngineUnitById,
  setCustomEngine,
  setPrimeMoverEngineName,
} from '../../store/prime-mover.actions';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { OtherOptionDirective } from '@shared/directives/other-option.directive';
import { GovukTextInputComponent } from '../../../../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-prime-mover-engine',
  standalone: true,
  templateUrl: './prime-mover-engine.component.html',
  styleUrl: './prime-mover-engine.component.scss',
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
export class PrimeMoverEngineComponent {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.PRIME_MOVER_ENGINE_MODEL}`;
  form: FormGroup;

  engines$: Observable<Engine[]>;
  customUnit = false;

  validationMessages = {
    engineName: {
      required: 'Select a prime mover engine',
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
      engineName: [null, [Validators.required]],
      engineUnitOther: [null, []],
    });
  }

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectPrimeMoverEngineName),
      this.store.select(selectPrimeMoverEngineOther),
      this.store.select(selectPrimeMoverCustomUnit),
    ])
      .pipe(first())
      .subscribe(([engineName, engineUnitOther, customUnit]) => {
        this.customUnit = customUnit;
        this.form.patchValue({
          engineName,
          engineUnitOther,
        });
      });
    this.engines$ = this.store.pipe(
      select(selectPrimeMoverEngineModel),
      switchMap(model => {
        return this.unitService.getEngines(model.id);
      })
    );

    this.form.get('engineName').valueChanges.subscribe(value => {
      this.customUnit = value.id === 'other';
    });
  }

  onContinue() {
    if (this.form.valid) {
      const engineName = {
        id: this.form.get('engineName')?.value.id,
        name: this.form.get('engineName')?.value.name,
      };

      if (this.customUnit) {
        this.store.dispatch(
          setCustomEngine({
            engineUnitOther: this.form.get('engineUnitOther').value,
          })
        );
      } else {
        this.store.dispatch(getEngineUnitById({ id: engineName.id }));
      }
      this.store.dispatch(setPrimeMoverEngineName({ engineName }));
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
