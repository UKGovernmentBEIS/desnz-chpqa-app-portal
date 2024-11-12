import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { ErrorMessageComponent } from '../error-messages/error-message/error-message.component';
import { GovukRadioInputComponent } from '../form-controls/govuk-radio-input/govuk-radio-input.component';
import { Address } from '@shared/models';
import { DynamicFormErrorsSummaryComponent } from '../dynamic-form-builder/components/dynamic-form-errors-summary';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';

@Component({
  selector: 'app-address-select',
  standalone: true,
  templateUrl: './address-select.component.html',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormErrorDirective,
    GovukRadioInputComponent,
    ErrorMessageComponent,
    DynamicFormErrorsSummaryComponent
  ]
})
export class AddressSelectComponent implements OnInit {
  @Input() navigateToEnterAddressManually: string;
  @Input() navigateToSearchAgain: string;
  @Input() linkText: string = 'Enter address manually';
  @Input() caption: string = '';
  @Input({ required: true }) title!: string;
  @Input() searchCriteria: string;
  @Input() searchResults: Address[];
  @Input() selectedResult: Address;
  @Input() limitResultsTo: number = 10;
  @Output() search = new EventEmitter<Address>();

  form: FormGroup;
  results: RadioButtonOption[] = [];
  formUpdated = false;

  validationMessages = {
    address: {
      required: 'Select an organisation address'
    }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      address: [null, [Validators.required]],
    });

    this.searchResults?.slice(0, this.limitResultsTo).forEach(searchResult => {
      const option = {
        label: searchResult.address1,
        value: `${searchResult.address1}${searchResult.address2}`,
      };
      this.results.push(option);

      if (
        this.selectedResult &&
        searchResult.address1 === this.selectedResult.address1
      ) {
        this.form.patchValue({ address: option });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const selectedAddress = this.searchResults.find(
        searchResult =>
          `${searchResult.address1}${searchResult.address2}` === this.form.get('address').value.value
      );

      this.search.emit(selectedAddress);
    } else {
      this.form.markAllAsTouched();
      this.formUpdated = true;
    }
  }
}
