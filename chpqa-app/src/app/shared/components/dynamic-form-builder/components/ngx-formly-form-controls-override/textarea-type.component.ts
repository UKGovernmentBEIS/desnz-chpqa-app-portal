import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-govuk-textarea',
  template: `
    <div class="govuk-form-group" [ngClass]="{ 'govuk-form-group--error': showError }">
      <label class="govuk-label" [for]="to.id || id">{{ to.label }}</label>
      <div *ngIf="showError" class="govuk-error-message">{{ errorMessage }}</div>
      <div *ngIf="to.description" class="govuk-hint">{{ to.description }}</div>
      <textarea class="govuk-textarea" [class.govuk-textarea--error]="showError" [id]="to.id || id" [formControl]="formControl" [formlyAttributes]="field"></textarea>
    </div>
  `,
})
export class TextareaTypeComponent extends FieldType {
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
