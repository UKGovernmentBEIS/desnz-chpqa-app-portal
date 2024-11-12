import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';

@Directive({
  selector: '[appFormError]',
  standalone: true,
})
export class FormErrorDirective {
  @Input('appFormError') form: FormGroup;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  @HostListener('submit', ['$event'])
onSubmit(event: Event) {
  event.preventDefault();
  this.validateForm();
  if (!this.form.valid) {
    this.form.markAllAsTouched();
    this.cdr.detectChanges();
  }
}

private validateForm() {
  if (this.form.valid) {
    this.el.nativeElement.querySelectorAll('.govuk-form-group').forEach((group: HTMLElement) => {
      group.classList.remove('govuk-form-group--error');
    });
  } else {
    Object.keys(this.form.controls).forEach(field => {
      const control = this.form.controls[field];
      const inputElement = this.el.nativeElement.querySelector(`[name="${field}"]`);
      const formGroup = inputElement?.closest('.govuk-form-group');

      if (control.invalid) {
        if (formGroup) {
          formGroup.classList.add('govuk-form-group--error');
        }
        inputElement?.classList.add('govuk-input--error');
      } else {
        formGroup?.classList.remove('govuk-form-group--error');
        inputElement?.classList.remove('govuk-input--error');
      }
    });
  }
  this.cdr.detectChanges(); // Ensure UI updates with error messages
}

}
