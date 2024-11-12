import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorMessageComponent } from '../error-messages/error-message/error-message.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { RouterModule } from '@angular/router';
import { DynamicFormErrorsSummaryComponent } from '../dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukTextInputComponent } from '../form-controls/govuk-text-input/govuk-text-input.component';
import { SearchAddressCriteria } from '@shared/models';

@Component({
  selector: 'app-address-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorMessageComponent,
    FormErrorDirective,
    RouterModule,
    DynamicFormErrorsSummaryComponent,
    GovukTextInputComponent,
  ],
  templateUrl: './address-search.component.html',
})
export class AddressSearchComponent implements OnInit {
  @Input() navigateTo: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) caption!: string;
  @Input() prefilledValues?: SearchAddressCriteria;
  @Output() search = new EventEmitter<SearchAddressCriteria>();

  form: FormGroup;
  ukPostcodePattern = new RegExp(
    '^(GIR ?0AA|[A-PR-UWYZ]([0-9][0-9]?|([A-HK-Y][0-9][0-9]?)|([0-9][A-HJKPSTUW])|([A-HK-Y][0-9][ABEHMNPRVWXY])) ?[0-9][ABD-HJLNP-UW-Z]{2})$',
    'i'
  );
  postcodeControlName = 'postcode';
  nameOrBuildingNumberControlName = 'nameOrBuildingNumber';

  formUpdated = false;

  validationMessages = {
    postcode: {
      required: 'Enter a postcode in the correct format',
      pattern: 'Enter a postcode in the correct format',
    },
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        postcode: [this.prefilledValues.postcode, [Validators.required, Validators.pattern(this.ukPostcodePattern)]],
        nameOrBuildingNumber: [this.prefilledValues.nameOrBuildingNumber, []],
      },
      {
        updateOn: 'submit',
      }
    );
  }

  onSubmit() {
    if (this.form.valid) {
      this.search.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
      this.formUpdated = true;
    }
  }
}
