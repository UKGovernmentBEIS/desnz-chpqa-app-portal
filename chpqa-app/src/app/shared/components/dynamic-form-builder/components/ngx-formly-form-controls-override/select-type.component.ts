import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-govuk-select',
  template: `
    <div class="govuk-form-group" [ngClass]="{ 'govuk-form-group--error': showError }">
      <label class="govuk-label" [for]="to.id || id">{{ to.label }}</label>
      <div *ngIf="showError" class="govuk-error-message">{{ errorMessage }}</div>
      <div *ngIf="to.description" class="govuk-hint">{{ to.description }}</div>
      <select class="govuk-select" [class.govuk-select--error]="showError" [id]="to.id || id" [formControl]="formControl" [formlyAttributes]="field">
        <option *ngFor="let option of to.options" [value]="option.value">{{ option.label }}</option>
      </select>
    </div>
  `,
})
export class SelectTypeComponent extends FieldType {
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
