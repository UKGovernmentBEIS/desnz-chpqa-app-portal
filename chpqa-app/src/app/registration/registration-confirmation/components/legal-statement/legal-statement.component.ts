import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { GovukRadioInputComponent } from '@shared/components/form-controls/govuk-radio-input/govuk-radio-input.component';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { Store } from '@ngrx/store';
import { selectAgreeToTerms, setAgreeToTerms } from '../../store';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-legal-statement',
  standalone: true,
  imports: [RouterModule, AsyncPipe, ReactiveFormsModule, FormErrorDirective, GovukRadioInputComponent],
  templateUrl: './legal-statement.component.html',
  styleUrl: './legal-statement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalStatementComponent {
  BACK = `../${RegistrationConfirmationPath.CHOOSE_PASSWORD}`;
  TERMS_LINK = `../${RegistrationConfirmationPath.TERMS_CONDITIONS}`;

  options: RadioButtonOption[] = [{ label: 'I agree to the terms and conditions', value: true }];

  form$ = this.store.select(selectAgreeToTerms).pipe(
    map(agreeToTerms => {
      const selectedOption = this.options.find(option => option.value === agreeToTerms);
      return this.fb.group(
        {
          agreeToTerms: [selectedOption, [Validators.required]],
        },
        { updateOn: 'submit' }
      );
    })
  );

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  onContinue(form: FormGroup) {
    if (form.valid) {
      const agreeToTerms = form.controls.agreeToTerms.value.value;
      this.store.dispatch(setAgreeToTerms({ agreeToTerms }));
    }
  }
}
