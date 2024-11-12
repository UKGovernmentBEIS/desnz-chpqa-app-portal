import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appValidation]',
  standalone: true,
})
export class ValidationDirective implements OnInit {
  @Input('appValidation') controlName: string;

  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}

  ngOnInit(): void {
    this.control.valueChanges.subscribe(() => this.applyErrorClass());
    this.control.statusChanges.subscribe(() => this.applyErrorClass());
  }

  @HostListener('blur') onBlur() {
    this.applyErrorClass();
  }

  private applyErrorClass() {
    const control = this.control.control;
    if (control && control.touched && control.invalid) {
      this.el.nativeElement.classList.add('govuk-input--error');
    } else {
      this.el.nativeElement.classList.remove('govuk-input--error');
    }
  }
}
