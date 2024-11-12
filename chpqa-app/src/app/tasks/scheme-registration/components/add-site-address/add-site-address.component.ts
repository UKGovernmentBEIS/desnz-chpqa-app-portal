import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { Store } from '@ngrx/store';
import {
  selectManuallyInsertedSiteAddress,
  selectSite,
  setSite,
} from '../../store';
import { Address as Site } from '@shared/models';
import { Observable, map, of, switchMap } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-add-site-address',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    GovukTextInputComponent,
    AsyncPipe,
    NgIf,
    DynamicFormErrorsSummaryComponent
  ],
  templateUrl: './add-site-address.component.html',
  styleUrl: './add-site-address.component.scss',
})
export class AddSiteAddressComponent {
  BACK = '../' + SchemeRegistartiondPath.SEARCH_SITE_ADDRESS;
  searchAddress = '../' + SchemeRegistartiondPath.SEARCH_SITE_ADDRESS;

  copy = schemeRegistrationCopy;

  manuallyInsertedSiteAddress$ = this.store.select(
    selectManuallyInsertedSiteAddress
  );
  site$ = this.store.select(selectSite);

  validationMessages = {
    address1: {
      required: 'Enter address line 1, typically the building and street',
    },
    town: {
      required: 'Enter a town or city',
    },
    postcode: {
      required: 'Enter a postcode in the correct format',
    },
  };
  
  formUpdated = false;

  form$: Observable<FormGroup> = this.manuallyInsertedSiteAddress$.pipe(
    switchMap((manual: boolean) => {
      if (manual) {
        return this.site$.pipe(
          map((site: Site) => {
            return this.fb.group(
              {
                address1: [site.address1, [Validators.required]],
                address2: [site.address2, []],
                town: [site.town, [Validators.required]],
                county: [site.county, []],
                postcode: [site.postcode, [Validators.required]],
              },
              {
                updateOn: 'submit',
              }
            );
          })
        );
      } else {
        return of(
          this.fb.group(
            {
              address1: ['', [Validators.required]],
              address2: ['', []],
              town: ['', [Validators.required]],
              county: ['', []],
              postcode: ['', [Validators.required]],
            },
            {
              updateOn: 'submit',
            }
          )
        );
      }
    })
  );

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  onSubmit(form: FormGroup) {
    if (form.valid) {
      const site: Site = {
        ...form.getRawValue(),
      };

      this.store.dispatch(
        setSite({ site: site, manuallyInsertedSiteAddress: true })
      );
    } else {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
