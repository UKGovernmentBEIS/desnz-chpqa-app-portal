import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable, combineLatest, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { OrganisationInfoBannerComponent } from '@shared/components/organisation-info-banner/organisation-info-banner.component';
import { FormWizardPath } from '../../models/form-wizard-path.model';
import { formWizardFeature } from '../../store/form-wizard.reducer';
import { setMeetsCriteria } from '../../store/form-wizard.actions';
import { selectSelectedScheme } from '@shared/store';
import { SchemeRegistration } from 'src/app/tasks/scheme-registration/models/scheme-registration.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';

@Component({
  selector: 'app-choose-criteria',
  standalone: true,
  templateUrl: './choose-criteria.component.html',
  styleUrl: './choose-criteria.component.scss',
  imports: [
    RouterModule,
    GovukRadioInputComponent,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    OrganisationInfoBannerComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class ChooseCriteriaComponent {
  scheme$ = this.store.select(selectSelectedScheme);

  BACK$ = this.scheme$.pipe(
    map(
      (scheme: ReplyScheme) =>
        `${FormWizardPath.BASE_PATH}/${scheme.id}/${FormWizardPath.BEFORE_START}`
        // `${FormWizardPath.BASE_PATH}/${scheme.id}/${FormWizardPath.CHOOSE_OPERATIONAL}`
    )
  );

  validationMessages = {
    criteria: {
      required: 'Select yes if the scheme meets all the criteria',
    },
  };

  formUpdated = false;
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  form$: Observable<FormGroup> = this.store
    .select(formWizardFeature.selectMeetsCriteria)
    .pipe(
      map(meetsCriteria => {
        const selectedOption = this.options.find(
          option => option.value === meetsCriteria
        );
        return this.fb.group(
          {
            criteria: [selectedOption, [Validators.required]],
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
      const meetsCriteria = form.controls['criteria'].value.value;
      this.store.dispatch(setMeetsCriteria({ meetsCriteria }));
    } else {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
