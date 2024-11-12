import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { PasswordFormControlComponent } from '@shared/components/password-form-control/password-form-control.component';
import { confirmPasswordValidator } from '@shared/shared.util';
import { passwordComplexity, passwordContainsEmail } from '@shared/utils/validators-utils';
import { Subscription } from 'rxjs';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { selectEmail, setPassword } from '../../store';

type ValidationMessages = {
  [key: string]: {
    [validatorKey: string]: string;
  };
};

@Component({
  selector: 'app-choose-password-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PasswordFormControlComponent,
    DynamicFormErrorsSummaryComponent
  ],
  templateUrl: './choose-password-form.component.html',
  styleUrls: ['./choose-password-form.component.scss'],
})
export class ChoosePasswordFormComponent implements OnChanges, OnDestroy {
  BACK = `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.CONFIRM_ORGANISATION_ADDRESS}`;

  @Input() password: string;
  @Output() continue = new EventEmitter();

  form: FormGroup;
  formUpdated = false;
  validationMessages: ValidationMessages = {
    password: {
      required: 'Enter a valid password',
      minlength: 'Enter a valid password',
      containsEmail: 'Password must not contain part of the email.',
      complexity: 'Enter a valid password',
    },
    passwordConfirmation: {},
    formErrors: {
      passwordMismatch: 'Passwords must match',
    },
  };

  passwordComplexityErrors: any = {
    minLength: false,
    hasDigit: false,
    hasNonAlphanumeric: false,
  };

  ERROR_IMAGE_SRC = "assets\\images\\error_circle.png";
  CHECK_IMAGE_SRC = "assets\\images\\check_circle.png";

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.subscriptions.add(
      this.store.select(selectEmail).subscribe(res => {
        const emailAddress = res || 'kajower223@regishub.com'; // TODO - used for test

        this.form = this.fb.group(
          {
            password: ['', [Validators.required, Validators.minLength(14), passwordContainsEmail(emailAddress), passwordComplexity()]],
            passwordConfirmation: [''],
          },
          {
            validators: confirmPasswordValidator,
          }
        );
        this.subscriptions.add(
          this.form.controls['password'].valueChanges.subscribe(res => {
            const passwordControl = this.form.controls.password;
            const errors = passwordControl.errors;
            this.passwordComplexityErrors.minLength = (errors?.hasUpperCase === false && errors?.hasLowerCase === false) || errors?.minlength;
            this.passwordComplexityErrors.hasDigit = errors?.hasDigit === false;
            this.passwordComplexityErrors.hasNonAlphanumeric = errors?.hasNonAlphanumeric === false;
          })
        );
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.form.patchValue({
        password: changes['password'].currentValue,
        passwordConfirmation: changes['password'].currentValue,
      });
    }
  }

  onSubmit() {
    this.formUpdated = true;
    if (this.form.valid) {
      const password = this.form.value.password;
      this.store.dispatch(setPassword({ password }));
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  get passwordHasError() {
    const control = this.form.controls['password'];
    return control.invalid && (control.dirty || control.touched);
  }

  get isPasswordMismatched() {
    return this.form.errors?.passwordMismatch && !this.passwordHasError;
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}
