import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { Store } from '@ngrx/store';
import { selectSiteContactDetails, setSiteContactDetails } from '../../store';
import { map } from 'rxjs';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-site-contact-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, GovukRadioInputComponent, FormErrorDirective],
  templateUrl: './site-contact-details.component.html',
  styleUrl: './site-contact-details.component.scss',
})
export class SiteContactDetailsComponent {
  BACK = `../` + SchemeRegistartiondPath.CONFIRM_SITE_ADDRESS;
  form: FormGroup;

  options: RadioButtonOption[] = [
    { label: 'I am the site contact for this scheme', value: true },
    { label: 'Edit site contact details', value: false },
  ];

  copy = schemeRegistrationCopy;

  vm$ = this.store.select(selectSiteContactDetails).pipe(
    map(areYouTheSiteContactPerson => {
      const selectedOption = this.options.find(option => option.value === areYouTheSiteContactPerson);
      return (this.form = this.fb.group(
        {
          areYouTheSiteContactPerson: [selectedOption ?? null, [Validators.required]],
        },
        { updateOn: 'submit' }
      ));
    })
  );

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store
  ) {}

  onSubmit() {
    if (this.form.valid) {
      this.store.dispatch(
        setSiteContactDetails({
          areYouTheSiteContactPerson: this.form.controls.areYouTheSiteContactPerson.value.value,
        })
      );
      this.form.controls.areYouTheSiteContactPerson.value.value
        ? this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.CONFIRM_SITE_CONTACT])
        : this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.ADD_SITE_CONTACT]);
    }
  }
}
