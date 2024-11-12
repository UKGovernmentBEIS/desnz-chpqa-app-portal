import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  AbstractControl,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';

@Component({
  selector: 'app-govuk-number-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './gov-uk-number-form-control.component.html',
  styleUrl: './gov-uk-number-form-control.component.scss',
})
export class GovukNumberFormControlComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() controlName: string;
  @Input() label: string;
  @Input() description = '';
  @Input() unit: string = null;
  @Input() maxLength: number;
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-third';
  @Input() validationMessages: { [key: string]: string };
  control: AbstractControl;

  private onChangeSubs: Subscription[] = [];

  constructor(public rootFormGroup: FormGroupDirective) {}

  ngOnInit() {
    this.control = this.rootFormGroup.form.get(this.controlName);
  }

  ngOnDestroy() {
    this.onChangeSubs.forEach(sub => sub.unsubscribe());
  }

  registerOnChange(onChange: any) {
    if (this.control) {
      const sub = this.control.valueChanges.subscribe(onChange);
      this.onChangeSubs.push(sub);
    }
  }

  registerOnTouched(onTouched: any) {
    if (this.control) {
      this.control.valueChanges.subscribe(() => {
        onTouched();
      });
    }
  }

  writeValue(value: any) {
    const control = this.rootFormGroup.form.get(this.controlName);
    if (control && value !== undefined) {
      control.setValue(value, { emitEvent: false });
    }
  }

  setDisabledState(isDisabled: boolean) {
    const control = this.rootFormGroup.form.get(this.controlName);
    if (control) {
      if (isDisabled) {
        control.disable();
      } else {
        control.enable();
      }
    }
  }

  hasError() {
    return this.control.invalid && this.control.touched;
  }
}
