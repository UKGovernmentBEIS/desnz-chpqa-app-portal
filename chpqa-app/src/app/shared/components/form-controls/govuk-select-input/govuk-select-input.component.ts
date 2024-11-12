import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  AbstractControl,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ErrorMessageComponent } from '../../error-messages/error-message/error-message.component';
import { GovukTextWidthClass } from '@shared/models/govuk-types.model';
import { OptionItem } from '@shared/models/option-item.model';

@Component({
  selector: 'app-govuk-select-input',
  standalone: true,
  templateUrl: './govuk-select-input.component.html',
  styleUrls: ['./govuk-select-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukSelectInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukSelectInputComponent),
      multi: true,
    },
  ],
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, ErrorMessageComponent],
})
export class GovukSelectInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() controlName: string;
  @Input() label = '';
  @Input() options: OptionItem[];
  @Input() placeholder = '';
  @Input() widthClass: GovukTextWidthClass = 'govuk-!-width-one-third';
  @Input() validationMessages: { [key: string]: string };

  control: AbstractControl;

  private onChangeSubs: Subscription[] = [];

  constructor(
    public rootFormGroup: FormGroupDirective,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.control = this.rootFormGroup.form.get(this.controlName);
    this.updateSelectedOption();
  }

  ngAfterViewInit() {
    this.updateSelectedOption();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this.updateSelectedOption();
    }
  }

  onOptionsUpdate() {
    this.updateSelectedOption();
  }

  private updateSelectedOption() {
    if (this.options && this.options.length > 0) {
      const selectedOption = this.options.find(
        option => option.id === this.control?.value?.id
      );
      if (selectedOption) {
        this.control.setValue(selectedOption);
      } else if (this.placeholder && this.control) {
        this.control.setValue('');
      }
    }
    this.cdr.detectChanges();
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
    return this.control?.invalid && this.control.touched;
  }
}
