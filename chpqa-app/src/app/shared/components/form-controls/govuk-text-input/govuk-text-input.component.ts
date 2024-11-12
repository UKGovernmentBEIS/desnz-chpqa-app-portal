import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroupDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GovukTextWidthClass, HTMLInputType } from '@shared/models/govuk-types.model';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';

@Component({
  selector: 'app-govuk-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './govuk-text-input.component.html',
  styleUrls: ['./govuk-text-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukTextInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukTextInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GovukTextInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() controlName: string;
  @Input() label: string;
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-half';
  @Input() description = '';
  @Input() inputType: HTMLInputType = 'text';
  @Input() validationMessages: { [key: string]: string };
  @Input() value: string;
  @Input() id: string;
  @Input() maxLength: number;

  control: AbstractControl;

  private onChangeSubs: Subscription[] = [];

  constructor(public formGroupDirective: FormGroupDirective) {}

  ngOnInit() {
    this.control = this.formGroupDirective.form.get(this.controlName);
    if (this.control) {
      if (this.value) {
        this.writeValue(this.value);
      }
    } else {
      console.error(`Control with name '${this.controlName}' not found in form`);
    }
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
    return this.control && this.control.invalid && this.control.touched;
  }
}
