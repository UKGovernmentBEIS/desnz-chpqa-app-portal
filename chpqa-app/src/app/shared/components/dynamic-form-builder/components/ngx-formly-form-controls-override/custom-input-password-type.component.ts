import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-custom-password',
  template: `
    <div class="govuk-form-group" [ngClass]="{ 'govuk-form-group--error': showError }">
     <div *ngIf="to.description" class="govuk-hint" [innerHTML]="to.description"></div>
      <label class="govuk-label" [attr.for]="id">{{ to.label }}</label>
        <div *ngIf="showError" class="govuk-error-message">{{ errorMessage }}</div>

      <input
        [formControl]="formControl"
        [formlyAttributes]="field"
        [class]="getInputClass()"
        [id]="to.id"
        [type]="hide ? 'password' : 'text'" />
      <button
        (click)="toggleHide()"
        type="button"
        class="govuk-button govuk-button--secondary govuk-password-input__toggle govuk-js-password-input-toggle"
        [attr.aria-controls]="to.id"
        aria-label="Show password">
        {{ hide ? 'Show' : 'Hide' }}
      </button>
    </div>
  `,
})
export class CustomPasswordTypeComponent extends FieldType {
  hide: boolean = true;

  getInputClass() {
    return 'govuk-input govuk-password-input__input govuk-js-password-input-input govuk-!-width-one-half';
  }

  toggleHide() {
    this.hide = !this.hide;
  }

  get errorMessage() {
    const errors = this.formControl.errors;
    if (errors) {
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          return this.to.errorMessages[key];
        }
      }
    }
    return '';
  }
}
