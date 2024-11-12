import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormGroupDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from "../../error-messages/error-message/error-message.component";

import { GovukUnitInputComponent } from '../govuk-unit-input/govuk-unit-input.component';

@Component({
    selector: 'app-govuk-currency-input',
    standalone: true,
    templateUrl: './govuk-currency-input.component.html',
    styleUrl: './govuk-currency-input.component.scss',
    imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
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
export class GovukCurrencyInputComponent {
  @Input() controlName: string;
  @Input() label = "";
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-third';
  @Input() description = '';
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
