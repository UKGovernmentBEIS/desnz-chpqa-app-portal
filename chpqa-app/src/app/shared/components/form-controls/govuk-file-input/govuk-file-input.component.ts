import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroupDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageComponent } from '@shared/components/error-messages/error-message/error-message.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-govuk-file-input',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './govuk-file-input.component.html',
  styleUrl: './govuk-file-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GovukFileInputComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GovukFileInputComponent),
      multi: true,
    },
  ],
})
export class GovukFileInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() controlName: string;
  @Input() label = "";
  @Input() caption = "";
  @Input() description = "";
  @Input() validationMessages: { [key: string]: string };

  @Output() fileAdded = new EventEmitter<File[]>();

  isDragging = false;

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
      const currentFiles = control.value || [];
      const newFiles = [...currentFiles, ...value];
      control.setValue(newFiles);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onFileSelected(event: any) {
    const selectedFiles = Array.from(event.target.files) as File[];
    this.writeValue(selectedFiles);
    this.onChange(selectedFiles);
    this.fileAdded.emit(selectedFiles);
    event.target.value = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const droppedFiles = Array.from(event.dataTransfer!.files) as File[];
    this.writeValue(droppedFiles);
    this.onChange(droppedFiles);
    this.fileAdded.emit(droppedFiles);
  }


  hasError() {
    return this.control.invalid && this.control.touched;
  }
}
