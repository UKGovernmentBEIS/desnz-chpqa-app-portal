import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DynamicFormBuilderService } from '../../services/dynamic-form-builder.service';

@Component({
  selector: 'app-dynamic-form-wrapper',
  template: `
    <app-dynamic-form-errors-summary [formUpdated]="formUpdated" [form]="form" [validationMessages]="validationMessages"></app-dynamic-form-errors-summary>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <formly-form [model]="model" [fields]="fields" [form]="form"></formly-form>
      <button type="submit" class="govuk-button">{{ submitLabel }}</button>
    </form>
  `,
})
export class DynamicFormWrapperComponent implements OnChanges {
  @Input() form: FormGroup;
  @Input() model: any;
  @Input() fields: FormlyFieldConfig[];
  @Input() formUpdated = false;
  @Input() submitLabel = 'Submit';
  @Output() formSubmitted = new EventEmitter<any>();

  constructor(private formBuilderService: DynamicFormBuilderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fields || changes.model) {
      this.form = new FormGroup({});
      this.fields = this.formBuilderService.getResponsiblePersonFormFields();
      this.model = this.formBuilderService.getResponsiblePersonFormInitialValues(null);
    }
  }

  submit() {
    this.formUpdated = true;
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  get validationMessages() {
    const messages: any = {};
    this.fields.forEach(field => {
      if (typeof field.key === 'string') {
        messages[field.key] = field.props?.errorMessages || {};
      }
    });
    return messages;
  }
}
