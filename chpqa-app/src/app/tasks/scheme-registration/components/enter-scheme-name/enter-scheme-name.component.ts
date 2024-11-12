import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorMessageComponent } from '@shared/components/error-messages/error-message/error-message.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { Store } from '@ngrx/store';
import {
  selectSchemeName,
  setResponsiblePerson,
  setSchemeName,
} from '../../store';
import { GovukTextInputComponent } from '../../../../shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { combineLatest, map } from 'rxjs';
import { selectUser } from 'src/app/auth/auth.selector';
import { PersonDetails } from '../../models/scheme-registration.model';
import { DynamicFormErrorsSummaryComponent } from "../../../../shared/components/dynamic-form-builder/components/dynamic-form-errors-summary/dynamic-form-errors-summary.component";
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-enter-scheme-name',
  standalone: true,
  templateUrl: './enter-scheme-name.component.html',
  styleUrl: './enter-scheme-name.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMessageComponent,
    FormErrorDirective,
    RouterModule,
    GovukTextInputComponent,
    DynamicFormErrorsSummaryComponent
],
})
export class EnterSchemeNameComponent {
  BACK = `../${SchemeRegistartiondPath.BEFORE_REGISTRATION_STARTS}`;

  copy = schemeRegistrationCopy;

  loggedInUser$ = this.store.select(selectUser);
  form$ = this.store.select(selectSchemeName).pipe(
    map((name: string) => {
      return this.fb.group(
        { name: [name, [Validators.required]] },
        { updateOn: 'submit' }
      );
    })
  );

  vm$ = combineLatest([this.loggedInUser$, this.form$]).pipe(
    map(([loggedInUser, form]) => ({ loggedInUser, form }))
  );

  validationMessages = {
    name: {
      required: 'Enter a scheme name',
    },
  };

  formUpdated = false;

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  onSubmit(form: FormGroup, loggedInUser: any) {
    if (form.valid) {
      const responsiblePerson: PersonDetails = {
        id: loggedInUser.id,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
      };

      this.store.dispatch(setResponsiblePerson({ responsiblePerson }));
      this.store.dispatch(setSchemeName(form.value));
    } else {
      form.markAllAsTouched();
      form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
