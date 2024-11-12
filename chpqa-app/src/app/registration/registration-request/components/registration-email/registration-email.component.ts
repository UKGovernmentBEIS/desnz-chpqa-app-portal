import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { ErrorMessageComponent } from '@shared/components/error-messages/error-message/error-message.component';
import { ValidationDirective } from '@shared/directives/validation.directive';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { selectEmail, sendRegistrationEmail } from '../../store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukTextInputComponent } from '@shared/components/form-controls/govuk-text-input/govuk-text-input.component';
import { ChqpaApiServiceWrapper } from '../../../../api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { take } from 'rxjs';

interface UserExistsResponse {
  message: string;
}

@Component({
  selector: 'app-registration-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMessageComponent,
    RouterModule,
    ValidationDirective,
    FormErrorDirective,
    GovukTextInputComponent,
    DynamicFormErrorsSummaryComponent
  ],
  templateUrl: './registration-email.component.html',
  styleUrls: ['./registration-email.component.scss'],
})
export class RegistrationEmailComponent implements OnInit {
  @ViewChild(DynamicFormErrorsSummaryComponent) dynamicFormErrorsSummaryComponent: DynamicFormErrorsSummaryComponent;
  BACK = `../`;
  registrationForm: FormGroup;
  email$ = this.store.select(selectEmail);
  formUpdated = false;
  validationMessages = {
    email: {
      required: 'Email address is required.',
      email: 'Enter an email address in the correct format',
      emailRegistered: 'This email address is already in use',
    },
  };

  constructor(
    private readonly fb: FormBuilder,
    private apiServiceWrapper: ChqpaApiServiceWrapper,
    private readonly store: Store
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registrationForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
      },
      {
        updateOn: 'submit',
      }
    );
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.checkUserExists();
    } else {
      this.markFormAsTouched();
    }
  }

  checkUserExists(): void {
    const { email } = this.registrationForm.value;
    this.apiServiceWrapper.checkIfUserExistsService.apiCheckIfUserExistsGet(email)
      .pipe(take(1))
      .subscribe((data: UserExistsResponse) => {
        data?.message === 'Email is already registered'
        ? this.handleEmailAlreadyRegisteredError()
        : this.store.dispatch(sendRegistrationEmail(this.registrationForm.getRawValue()));
      });
  }

  handleEmailAlreadyRegisteredError(): void {
    this.dynamicFormErrorsSummaryComponent.addControlError('email', 'emailRegistered', 'This email address is already in use');
    this.markFormAsTouched();
  }

  markFormAsTouched(): void {
    this.registrationForm.markAllAsTouched();
    this.formUpdated = true;
  }
}
