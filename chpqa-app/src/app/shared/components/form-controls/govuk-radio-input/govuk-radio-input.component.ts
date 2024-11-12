import { Component, Input, OnDestroy, OnInit, Type, forwardRef } from '@angular/core';
import { ControlValueAccessor, AbstractControl, FormGroupDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';
import { CommonModule } from '@angular/common';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { ConditionalInputConfig } from '@shared/models/conditional-input.model';
import { GovukSelectInputComponent } from '../govuk-select-input/govuk-select-input.component';
import { GovukTextareaInputComponent } from '../govuk-textarea-input/govuk-textarea-input.component';
import { GovukNumberFormControlComponent } from '../govuk-number-input/gov-uk-number-form-control.component';
import { GovukTextInputComponent } from '../govuk-text-input/govuk-text-input.component';
import { GovukDateInputComponent } from '../govuk-date-input/govuk-date-input.component';

@Component({
  selector: 'app-govuk-radio-input',
  standalone: true,
  templateUrl: './govuk-radio-input.component.html',
  styleUrl: './govuk-radio-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukRadioInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukRadioInputComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
})
export class GovukRadioInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() controlName: string;
  @Input() label = '';
  @Input() additionalClass: string;
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-half';
  @Input() description = '';
  @Input() options: RadioButtonOption[];
  @Input() validationMessages: { [key: string]: string };
  @Input() disabled = false;

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
      control.setValue(value);
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

  getComponentType(config: ConditionalInputConfig): Type<any> | null {
    switch (config.type) {
      case 'text':
        return GovukTextInputComponent;
      case 'number':
        return GovukNumberFormControlComponent;
      case 'select':
        return GovukSelectInputComponent;
      case 'textarea':
        return GovukTextareaInputComponent;
      case 'date':
        return GovukDateInputComponent;
      default:
        throw new Error('Unsupported input type');
    }
  }

  createInputs(config: ConditionalInputConfig): Record<string, any> {
    const baseInputs = {
      controlName: config.controlName,
      label: config.label,
      description: config?.description,
      validationMessages: config.validationMessages,
    };

    const extraInputs = {
      ...(config.type !== 'textarea' && config.type !== 'date' && { value: config.value }),
      ...(config.type === 'textarea' && config.maxChars !== undefined && { maxChars: config.maxChars }),
      ...(config.type === 'date' && { currentDate: config.currentDate }),
    };

    return { ...baseInputs, ...extraInputs };
  }
}
