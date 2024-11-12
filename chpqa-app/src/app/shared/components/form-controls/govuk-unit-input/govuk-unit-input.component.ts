import { NgIf, NgClass, CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '@shared/components/error-messages/error-message/error-message.component';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';

@Component({
  selector: 'app-govuk-unit-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './govuk-unit-input.component.html',
  styleUrl: './govuk-unit-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukUnitInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukUnitInputComponent),
      multi: true,
    },
  ],
})
export class GovukUnitInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() controlName: string;
  @Input() label = '';
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-half';
  @Input() description = '';
  @Input() unit = 'MWe';
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
    if (this.control && value !== undefined) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  setDisabledState(isDisabled: boolean) {
    if (this.control) {
      if (isDisabled) {
        this.control.disable();
      } else {
        this.control.enable();
      }
    }
  }

  hasError() {
    return this.control.invalid && this.control.touched;
  }
}
