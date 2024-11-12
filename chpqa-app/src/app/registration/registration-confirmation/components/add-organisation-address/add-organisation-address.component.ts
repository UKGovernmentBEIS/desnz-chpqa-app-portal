import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { RouterModule } from '@angular/router';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { Store } from '@ngrx/store';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { setOrganisationAddress } from '../../store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';

@Component({
  selector: 'app-add-organisation-address',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GovukTextInputComponent,
    FormErrorDirective,
    RouterModule,
    DynamicFormErrorsSummaryComponent
  ],
  templateUrl: './add-organisation-address.component.html'
})
export class AddOrganisationAddressComponent {
  BACK = `../${RegistrationConfirmationPath.CONFIRM_ORGANISATION_ADDRESS}`;
  searchForAddressLink = `../${RegistrationConfirmationPath.SEARCH_ORGANISATION_ADDRESS}`;

  validationMessages = {
    address1: {
      required: 'Enter address line 1, typically the building and street'
    },
    address2: {},
    town: {
      required: 'Enter town or city'
    },
    county: {},
    postcode: {
      required: 'Enter postcode in the correct format'
    }
  };

  formUpdated = false;

  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.form = this.fb.group(
      {
        address1: ['', Validators.required],
        address2: ['', []],
        town: ['', Validators.required],
        county: ['', []],
        postcode: ['', Validators.required],
      },
      {
        updateOn: 'submit',
      }
    );
  }

  onSubmit() {
    if (this.form.valid) {
      const address = this.form.value;
      this.store.dispatch(setOrganisationAddress({ address }));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
