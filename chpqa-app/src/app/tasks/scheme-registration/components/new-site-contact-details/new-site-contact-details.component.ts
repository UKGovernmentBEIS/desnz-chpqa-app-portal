import { Component } from '@angular/core';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectSiteContactDetails, setSiteContactDetails } from '../../store';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-new-site-contact-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, GovukRadioInputComponent, FormErrorDirective],
  templateUrl: './new-site-contact-details.component.html',
  styleUrl: './new-site-contact-details.component.scss',
})
export class NewSiteContactDetailsComponent {
  BACK = `../` + SchemeRegistartiondPath.CONFIRM_SITE_ADDRESS;
  form: FormGroup;
  description =
    'Select if you are the site contact (as the Responsible Person for this scheme), or if you need to edit the site contact you previously entered.';

  options: RadioButtonOption[] = [
    { label: 'I am the site contact for this scheme', value: true },
    { label: 'Add a new site contact', value: false },
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
        : this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.ADD_NEW_SITE_CONTACT]);
    }
  }
}
