import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicFormBuilderService } from '@shared/components/dynamic-form-builder/services/dynamic-form-builder.service';

// This component serves as an example of how to use the dynamic form builder with the custom wrapper.
// To see how it works, simply use it anywhere in your HTML template with
// <app-dynamic-form-builder-example></app-dynamic-form-builder-example>

@Component({
  selector: 'app-dynamic-form-builder-example',
  template: `
    <!-- This is the wrapper component that handles the dynamic form rendering -->
     <app-dynamic-form-wrapper
      [form]="form"
      [model]="model"
      [fields]="fields"
      [formUpdated]="formUpdated"
      (formSubmitted)="onFormSubmitted(form)">
    </app-dynamic-form-wrapper>
  `,
})
export class DynamicFormBuilderExampleComponent {
  // Reactive form group object
  form = new FormGroup({});
  // Model for form data fully dynamic
  model = this.formBuilderService.getDynamicFormBuilderExampleFormInitialValues();
  // Flag to indicate if the form has been updated
  formUpdated = false;
  // Fields configuration fetched from the form builder service
  fields = this.formBuilderService.getDynamicFormBuilderExampleFormFields();

  // Injecting the dynamic form builder service to get form fields
  constructor(private formBuilderService: DynamicFormBuilderService) {}

  // Method to handle form submission
  onFormSubmitted(form: FormGroup<any>) {
    console.log('form submitted', form);
  }
}
