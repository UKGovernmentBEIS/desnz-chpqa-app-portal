import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { formWizardFeature } from '../../store/form-wizard.reducer';
import { FormWizardPath } from '../../models/form-wizard-path.model';
import { setIsOperational } from '../../store/form-wizard.actions';
import { selectSelectedScheme } from '@shared/store';
import { SchemeRegistration } from 'src/app/tasks/scheme-registration/models/scheme-registration.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';

@Component({
  selector: 'app-choose-operational',
  standalone: true,
  templateUrl: './choose-operational.component.html',
  styleUrl: './choose-operational.component.scss',
  imports: [
    RouterModule,
    GovukRadioInputComponent,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class ChooseOperationalComponent {
  scheme$ = this.store.select(selectSelectedScheme);

  BACK$ = this.scheme$.pipe(
    map(
      (scheme: ReplyScheme) =>
        `${FormWizardPath.BASE_PATH}/${scheme.id}/${FormWizardPath.BEFORE_START}`
    )
  );

  validationMessages = {
    operational: {
      required: 'Select yes if the scheme is operational',
    },
  };

  formUpdated = false;
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  form$: Observable<FormGroup> = this.store
    .select(formWizardFeature.selectIsOperational)
    .pipe(
      map((isOperational: boolean) => {
        const selectedOption = this.options.find(
          option => option.value === isOperational
        );
        return this.fb.group(
          {
            operational: [selectedOption, [Validators.required]],
          },
          {
            updateOn: 'submit',
          }
        );
      })
    );

  vm$ = combineLatest([this.scheme$, this.BACK$, this.form$]).pipe(
    map(([schemeId, BACK, form]) => ({ schemeId, BACK, form }))
  );

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  onSubmit(form: FormGroup) {
    if (form.valid) {
      const isOperational = form.controls['operational'].value.value;
      this.store.dispatch(setIsOperational({ isOperational }));
    } else {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
