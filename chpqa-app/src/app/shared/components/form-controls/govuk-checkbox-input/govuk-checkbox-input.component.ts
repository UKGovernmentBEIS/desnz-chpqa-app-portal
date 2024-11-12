import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import {
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  FormGroupDirective,
  AbstractControl,
} from '@angular/forms';
import { ErrorMessageComponent } from '@shared/components/error-messages/error-message/error-message.component';
import { Subscription, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-govuk-checkbox-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './govuk-checkbox-input.component.html',
  styleUrl: './govuk-checkbox-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukCheckboxInputComponent),
    },
  ],
})
export class GovukCheckboxInputComponent {
  @Input() controlName: string;
  @Input() label: string;
  @Input() validationMessages: { [key: string]: string };
  @Input() disabled = false;

  value: string;
  control: AbstractControl;
  private onChangeSubs: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(public rootFormGroup: FormGroupDirective) {}

  ngOnInit() {
    this.control = this.rootFormGroup.form.get(this.controlName);

    if (!this.control) {
      console.error(
        `Control with name ${this.controlName} not found in the form group.`
      );
      return;
    }

    if (this.value) {
      this.writeValue(this.value);
    }

    if (this.disabled) {
      this.control?.disable();
    }
  }

  ngOnDestroy() {
    this.onChangeSubs.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerOnChange(onChange: any) {
    if (this.control) {
      const sub = this.control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(onChange);
      this.onChangeSubs.push(sub);
    }
  }

  registerOnTouched(onTouched: any) {
    if (this.control) {
      this.control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => onTouched());
    }
  }

  writeValue(value: any) {
    if (this.control) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.control) {
      isDisabled ? this.control.disable() : this.control.enable();
    }
  }

  hasError() {
    return this.control.invalid && this.control.touched;
  }
}
