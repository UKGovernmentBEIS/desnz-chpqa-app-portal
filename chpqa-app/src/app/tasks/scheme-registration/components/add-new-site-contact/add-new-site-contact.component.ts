import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { map } from 'rxjs';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { PersonDetails } from '../../models/scheme-registration.model';
import { selectContactPerson, setNewSiteContact } from '../../store';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-add-new-site-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormErrorDirective, GovukTextInputComponent],
  templateUrl: './add-new-site-contact.component.html',
  styleUrl: './add-new-site-contact.component.scss',
})
export class AddNewSiteContactComponent {
  BACK = '../' + SchemeRegistartiondPath.NEW_SITE_CONTACT_DETAILS;

  copy = schemeRegistrationCopy;

  form: FormGroup;

  vm$ = this.store.select(selectContactPerson).pipe(
    map((contactPerson: PersonDetails) => {
      return (this.form = this.fb.group(
        {
          firstName: [contactPerson?.firstName, [Validators.required]],
          lastName: [contactPerson?.lastName, [Validators.required]],
          jobTitle: [contactPerson?.jobTitle, [Validators.required]],
          email: [contactPerson?.email, [Validators.required]],
          telephone1: [contactPerson?.telephone1, [Validators.required]],
          telephone2: [contactPerson?.telephone2, []],
        },
        { updateOn: 'submit' }
      ));
    })
  );

  constructor(
    private store: Store,
    private fb: FormBuilder
  ) {}

  onSubmit() {
    if (this.form.valid) {
      this.store.dispatch(setNewSiteContact({ contactPerson: this.form.value }));
    } else {
      this.form.markAllAsTouched();
    }
  }
}
