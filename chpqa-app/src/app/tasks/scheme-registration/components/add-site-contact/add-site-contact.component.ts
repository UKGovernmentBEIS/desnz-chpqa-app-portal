import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { selectContactPerson, setNewSiteContact } from '../../store';
import { map } from 'rxjs';
import { PersonDetails } from '../../models/scheme-registration.model';
import { CommonModule } from '@angular/common';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-add-site-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    GovukTextInputComponent,
  ],
  templateUrl: './add-site-contact.component.html',
  styleUrl: './add-site-contact.component.scss',
})
export class AddSiteContactComponent {
  BACK = '../' + SchemeRegistartiondPath.SITE_CONTACT_DETAILS;

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
      this.store.dispatch(
        setNewSiteContact({ contactPerson: this.form.value })
      );
    } else {
      this.form.markAllAsTouched();
      // TODOOO
      // this.validationErrors.emit(this.getValidationErrors);
    }
  }
}
