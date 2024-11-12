import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';

import { DynamicFormErrorsSummaryComponent } from './components/dynamic-form-errors-summary';
import { DynamicFormWrapperComponent } from './components/dynamic-form-wrapper/dynamic-form-wrapper.component';
import {
  InputTypeComponent,
  RadioTypeComponent,
  SelectTypeComponent,
  TextareaTypeComponent,
} from './components/ngx-formly-form-controls-override';
import { CustomPasswordTypeComponent } from './components/ngx-formly-form-controls-override/custom-input-password-type.component';
import { DynamicFormBuilderExampleComponent } from './documentation/dynamic-form-builder-example.component';
import { DynamicFormBuilderService } from './services/dynamic-form-builder.service';

export function fieldMatchValidator(control: AbstractControl) {
  if (control?.value) {
    const { password, passwordConfirm } = control.value;

    // avoid displaying the message error when values are empty
    if (!passwordConfirm || !password) {
      return null;
    }

    if (passwordConfirm === password) {
      return null;
    }

    return { fieldMatch: { message: 'Passwords must match' } };
  } else {
    return null;
  }
}

const customFormlyConfig: ConfigOption = {
  validators: [
    {
      name: 'fieldMatch',
      validation: fieldMatchValidator,
    },
  ],
  types: [
    { name: 'govuk-radio', component: RadioTypeComponent },
    { name: 'govuk-input', component: InputTypeComponent },
    { name: 'govuk-textarea', component: TextareaTypeComponent },
    { name: 'govuk-select', component: SelectTypeComponent },
    { name: 'govuk-custom-password', component: CustomPasswordTypeComponent },
  ],
};

@NgModule({
  declarations: [
    RadioTypeComponent,
    InputTypeComponent,
    TextareaTypeComponent,
    SelectTypeComponent,
    CustomPasswordTypeComponent,
    DynamicFormWrapperComponent,
    DynamicFormBuilderExampleComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormErrorsSummaryComponent,
    FormlyModule.forRoot(customFormlyConfig),
  ],
  providers: [DynamicFormBuilderService],
  exports: [
    DynamicFormWrapperComponent,
    DynamicFormBuilderExampleComponent,
    FormlyModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class DynamicFormBuilderModule {}
