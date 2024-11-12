import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  AbstractControl,
  FormGroupDirective,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  Validators,
  NG_VALIDATORS,
  ValidatorFn,
} from '@angular/forms';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';
import { CurrentDateDirective } from '@shared/directives/current-date.directive';

@Component({
  selector: 'app-govuk-date-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent, CurrentDateDirective],
  templateUrl: './govuk-date-input.component.html',
  styleUrls: ['./govuk-date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GovukDateInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukDateInputComponent),
      multi: true,
    },
  ],
})
export class GovukDateInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() controlName: string;
  @Input() label: string;
  @Input() description = '';
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-third';
  @Input() validationMessages: { [key: string]: string };
  @Input() currentDate: false;

  control: AbstractControl;
  dateForm: FormGroup;
  private onChangeSubs: Subscription[] = [];
  private onTouched: () => void = () => {};

  constructor(public rootFormGroup: FormGroupDirective) {}

  ngOnInit() {
    this.dateForm = new FormGroup(
      {
        day: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(31)]),
        month: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(12)]),
        year: new FormControl(null, [Validators.required]),
      },
      { validators: this.dateValidator }
    );

    this.control = this.rootFormGroup.form.get(this.controlName);

    this.onChangeSubs.push(
      this.dateForm.valueChanges.subscribe(val => {

        const { day, month, year } = val;
        if (day && month && year) {
          const date = this.createDate(day, month, year);
          if (this.dateForm.invalid) {
            this.control.setErrors({
              invalidDate: true
            });
          } else {
            if (date) {
              this.control.setValue(date, { emitEvent: true });
            }
          }
        } else {
          if (this.dateForm.invalid) {
            this.control.setErrors({
              required: true
            });
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.onChangeSubs.forEach(sub => sub.unsubscribe());
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const group = control as FormGroup;
      const dayControl = group.get('day');
      const monthControl = group.get('month');
      const yearControl = group.get('year');
      if (dayControl?.invalid || monthControl?.invalid || yearControl?.invalid) {
        return { invalidDate: true };
      }

      return null;
    };
  }

  createDate(day: string | number, month: string | number, year: string | number): Date | null {
    if (day && month && year) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  registerOnChange(fn: any) {
    this.onChangeSubs.push(this.dateForm.valueChanges.subscribe(fn));
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  writeValue(value: any) {
    if (value instanceof Date) {
      this.dateForm.setValue(
        {
          day: value.getDate(),
          month: value.getMonth() + 1,
          year: value.getFullYear(),
        },
        { emitEvent: false }
      );
    } else {
      this.dateForm.reset();
    }
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.dateForm.disable();
    } else {
      this.dateForm.enable();
    }
  }

  hasError() {
    return this.control.invalid && this.control.touched;
  }

  onBlur() {
    this.onTouched();
  }
}
