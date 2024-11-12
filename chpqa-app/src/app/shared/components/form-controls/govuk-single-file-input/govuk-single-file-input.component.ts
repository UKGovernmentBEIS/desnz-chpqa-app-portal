import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { AbstractControl, FormGroupDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageComponent } from '@shared/components/error-messages/error-message/error-message.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-govuk-single-file-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './govuk-single-file-input.component.html',
  styleUrl: './govuk-single-file-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukSingleFileInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukSingleFileInputComponent),
      multi: true,
    },
  ],
})
export class GovukSingleFileInputComponent {
  @Input() title = '';
  @Input() label = '';
  @Input() description = '';
  @Input({ required: true }) controlName!: string;
  @Input() selectedFile?: File;
  @Input() validationMessages: { [key: string]: string };

  control: AbstractControl;
  onChange: (value: any) => void = () => {};

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
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onFileSelected(event: any) {
    const selectedFiles = Array.from(event.target.files) as File[];
    this.selectedFile = selectedFiles[0];
    this.writeValue(this.selectedFile);
    this.onChange(this.selectedFile);

    //This need to be done, due to the fact that if you upload one file
    //and then you try to upload that file again, the "change" event
    //will not be triggered.
    const input = event.target as HTMLInputElement;
    input.value = '';
  }

  hasError() {
    return this.control.invalid && this.control.touched;
  }
}
