import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-govuk-input',
  template: `
    <div class="govuk-form-group" [ngClass]="{ 'govuk-form-group--error': showError }">
      <label class="govuk-label" [for]="to.id || id">{{ to.label }}</label>
       <div *ngIf="showError" class="govuk-error-message">{{ errorMessage }}</div>
      <div *ngIf="to.description" class="govuk-hint">{{ to.description }}</div>
      <input class="govuk-input" [class.govuk-input--error]="showError" [id]="to.id || id" [type]="to.type || 'text'" [formControl]="formControl" [formlyAttributes]="field">
    </div>
  `,
})
export class InputTypeComponent extends FieldType {
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
