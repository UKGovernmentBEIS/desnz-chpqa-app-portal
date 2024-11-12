import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { GovukNumberFormControlComponent } from '../govuk-number-input/gov-uk-number-form-control.component';
import { Months } from '@shared/enums/months.enum';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';

@Component({
  selector: 'app-govuk-monthly-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GovukNumberFormControlComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './govuk-monthly-input.component.html',
  styleUrl: './govuk-monthly-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GovukMonthlyInputComponent),
      multi: true,
    },
  ],
})
export class GovukMonthlyInputComponent {
  @Input() monthsData: { [key in Months]?: number } = {};
  @Input() validationMessages: { [key: string]: string };
  @Input() unit: string = null;
  form: FormGroup;
  annualTotal: number = 0;
  months = Object.values(Months);

  private valueChangesSubscription: Subscription;
  private onChangeSubs: Subscription[] = [];
  private onTouched: () => void;

  constructor(
    private fb: FormBuilder,
    public rootFormGroup: FormGroupDirective
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeFormControls();
    this.subscribeToValueChanges();

    const parentForm = this.rootFormGroup.form;
    if (!parentForm.contains('months')) {
      parentForm.addControl('months', this.form);
    }
  }

  private initializeFormControls(): void {
    this.annualTotal = this.rootFormGroup.form.get('annualTotal').getRawValue();
    this.months.forEach(month => {
      this.form.addControl(
        month,
        this.fb.control(this.monthsData[month] ?? null, [Validators.required, Validators.min(0)])
      );
    });
  }

  private clearValidatorsForAllControls(): void {
    this.months.forEach(month => {
      const control = this.form.get(month) as FormControl;
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false }); // Avoid triggering valueChanges again
    });
  }

  private setValidatorsForAllControls(): void {
    this.months.forEach(month => {
      const control = this.form.get(month) as FormControl;
      control.setValidators([Validators.required, Validators.min(0)]);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private subscribeToValueChanges(): void {
    const handleValueChanges = () => {
      this.valueChangesSubscription = this.form.valueChanges.subscribe(values => {
        this.valueChangesSubscription.unsubscribe();
  
        const hasPositiveValue = this.months.some(month => {
          const control = this.form.get(month) as FormControl;
          return control.value > 0;
        });
  
        if (hasPositiveValue) {
          this.months.forEach(month => {
            const control = this.form.get(month) as FormControl;
            if (control.value >= 0) {
              this.clearValidatorsForControl(control);
            } else {
              this.setValidatorsForControl(control);
            }
          });
        } else {
          this.setValidatorsForAllControls();
        }
  
        this.calculateTotal(values);
        if (this.onTouched) this.onTouched();
        handleValueChanges();
      });
    };
  
    handleValueChanges();
  }

  private clearValidatorsForControl(control: FormControl): void {
    control.clearValidators();
    control.updateValueAndValidity();
  }

  private setValidatorsForControl(control: FormControl): void {
    control.setValidators([Validators.required, Validators.min(0)]);
    control.updateValueAndValidity();
  }


  ngOnDestroy() {
    this.onChangeSubs.forEach(sub => sub.unsubscribe());
  }

  calculateTotal(values: { [key: string]: number }): void {
    this.annualTotal = Object.values(values).reduce(
      (acc: number, value: number) => acc + value,
      0
    );
    this.updateAnnualTotalInParentForm();
  }

  updateAnnualTotalInParentForm(): void {
    const annualTotalControl = this.rootFormGroup.form.get('annualTotal');
    if (annualTotalControl) {
      annualTotalControl.setValue(this.annualTotal, { emitEvent: false });
    }
  }

  writeValue(value: any): void {
    if (value) {
      this.form.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    const sub = this.form.valueChanges.subscribe(fn);
    this.onChangeSubs.push(sub);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
