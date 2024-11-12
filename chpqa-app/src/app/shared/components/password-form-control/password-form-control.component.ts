import { NgClass } from '@angular/common';
import { Component, Input, forwardRef, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validator,
} from '@angular/forms';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'app-password-form-control',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './password-form-control.component.html',
  styleUrls: ['./password-form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PasswordFormControlComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PasswordFormControlComponent),
      multi: true,
    },
  ],
})
export class PasswordFormControlComponent
  implements ControlValueAccessor, Validator, OnDestroy
{
  @Input() id: string;
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-half';
  @Input() label: string;

  @Input() validationMessages: { [key: string]: string };
  form: FormGroup = this.fb.group({
    password: [''],
  });
  hide: boolean = true;

  onTouched: Function = () => {};

  onChangeSubs: Subscription[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnDestroy() {
    for (let sub of this.onChangeSubs) {
      sub.unsubscribe();
    }
  }

  registerOnChange(onChange: any) {
    const sub = this.form.valueChanges
      .pipe(map(value => value?.password))
      .subscribe(onChange);
    this.onChangeSubs.push(sub);
  }

  registerOnTouched(onTouched: Function) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  writeValue(value: any) {
    if (value) {
      Object.keys(value).forEach(key => {
        if (this.form.controls[key]) {
          this.form.controls[key].setValue(value[key], { emitEvent: false });
        }
      });
    }
  }

  validate(control: AbstractControl) {
    if (this.form.valid) {
      return null;
    }
    let errors: any = {};
    errors = this.addControlErrors(errors, 'password');
    return errors;
  }

  addControlErrors(allErrors: any, controlName: string) {
    const errors = { ...allErrors };
    const controlErrors = this.form.controls[controlName].errors;
    if (controlErrors) {
      errors[controlName] = controlErrors;
    }
    return errors;
  }

  getInputClass() {
    return `govuk-input govuk-password-input__input govuk-js-password-input-input ${this.widthClass}`;
  }

  toggleHide() {
    this.hide = !this.hide;
  }
}
