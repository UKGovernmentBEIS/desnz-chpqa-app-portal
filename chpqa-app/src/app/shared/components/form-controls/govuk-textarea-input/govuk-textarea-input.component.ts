import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, FormGroupDirective, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-govuk-textarea-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './govuk-textarea-input.component.html',
  styleUrl: './govuk-textarea-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukTextareaInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukTextareaInputComponent),
      multi: true,
    },
  ],
})
export class GovukTextareaInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() controlName: string;
  @Input() label = '';
  @Input() description = '';
  @Input() maxChars = 2000;
  control: AbstractControl;
  @Input() validationMessages: { [key: string]: string };
  @Input() disabled = false;

  private onChangeSubs: Subscription[] = [];

  constructor(public rootFormGroup: FormGroupDirective) {}

  ngOnInit() {
    this.control = this.rootFormGroup.form.get(this.controlName);
    if (this.disabled) {
      this.control?.disable();
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
    const control = this.rootFormGroup.form.get(this.controlName);
    if (control && value !== undefined) {
      control.setValue(value, { emitEvent: false });
    }
  }

  hasError() {
    return this.control.invalid && this.control.touched;
  }
}
