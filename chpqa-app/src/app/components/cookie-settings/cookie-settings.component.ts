import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { getFormValidationErrors } from '@shared/shared.util';

@Component({
  selector: 'app-cookie-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cookie-settings.component.html',
  styleUrl: './cookie-settings.component.scss',
})
export class CookieSettingsComponent {
  @Input() cookieSettings: boolean;
  @Output() readonly saveCookieSettings = new EventEmitter<{ acceptAnalytics: boolean }>();

  cookieSettingsForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private location: Location
  ) {
    this.cookieSettingsForm = this.fb.group(
      {
        acceptAnalytics: [this.cookieSettings],
      },
      {
        updateOn: 'submit',
      }
    );

    console.log('create form');
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cookieSettings']) {
      console.log('cookies accepted change', changes['cookieSettings'].currentValue);
      this.cookieSettingsForm?.controls['acceptAnalytics'].setValue(changes['cookieSettings'].currentValue);
      this.cookieSettingsForm?.controls['acceptAnalytics'].updateValueAndValidity();
    }
  }

  onSubmit() {
    this.saveCookieSettings.emit(this.cookieSettingsForm.value);
  }

  get getValidationErrors() {
    return getFormValidationErrors(this.cookieSettingsForm);
  }

  get email() {
    return this.cookieSettingsForm.controls['email'];
  }

  goBack(): void {
    this.location.back();
  }
}
