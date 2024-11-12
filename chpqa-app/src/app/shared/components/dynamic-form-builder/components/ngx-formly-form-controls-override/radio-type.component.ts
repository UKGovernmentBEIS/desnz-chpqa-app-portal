import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-govuk-radio',
  template: `
    <div class="govuk-form-group" [ngClass]="{ 'govuk-form-group--error': showError }">
      <fieldset class="govuk-fieldset">
        <legend class="govuk-fieldset__legend govuk-fieldset__legend--l">
          <h1 class="govuk-fieldset__heading">{{ props.label }}</h1>
        </legend>
        <div *ngIf="props.description" class="govuk-hint">{{ props.description }}</div>
        <div class="govuk-radios" data-module="govuk-radios">
          <div *ngFor="let option of props.options; let i = index" class="govuk-radios__item">
            <input
              class="govuk-radios__input"
              type="radio"
              [id]="id + '_' + i"
              [value]="option.value"
              [formControl]="formControl"
              [formlyAttributes]="field"
              (change)="onRadioChange(option.value)"
            />
            <label class="govuk-label govuk-radios__label" [for]="id + '_' + i">{{ option.label }}</label>
          </div>
        </div>
        <div
          *ngFor="let option of props.options; let i = index"
          class="govuk-radios__conditional"
          [class.govuk-radios__conditional--hidden]="formControl.value !== option.value"
        >
          <ng-container *ngIf="formControl.value === option.value">
            <ng-container *ngFor="let subField of field.fieldGroup">
              <formly-field [field]="subField"></formly-field>
            </ng-container>
          </ng-container>
        </div>
      </fieldset>
    </div>
  `,
  styles: [``],
})
export class RadioTypeComponent extends FieldType {
  get errorMessage() {
    const errors = this.formControl.errors;
    if (errors) {
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          return this.props.errorMessages[key];
        }
      }
    }
    return '';
  }

  onRadioChange(value: any) {
    if (this.props.change) {
      this.props.change(value);
    }
    this.formControl.setValue(value);
  }
}
