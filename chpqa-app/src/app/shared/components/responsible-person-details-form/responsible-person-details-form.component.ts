import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { ResponsiblePerson, ResponsiblePersonForm } from '@shared/models';
import { Subscription, take } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '../dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukNumberFormControlComponent } from '../form-controls/govuk-number-input/gov-uk-number-form-control.component';
import { GovukRadioInputComponent } from '../form-controls/govuk-radio-input/govuk-radio-input.component';
import { GovukTextInputComponent } from '../form-controls/govuk-text-input/govuk-text-input.component';
import { CompanyHouseService } from '@shared/services';

@Component({
  selector: 'app-responsible-person-details-form',
  standalone: true,
  templateUrl: './responsible-person-details-form.component.html',
  styleUrl: './responsible-person-details-form.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    GovukTextInputComponent,
    GovukNumberFormControlComponent,
    FormErrorDirective,
    GovukRadioInputComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class ResponsiblePersonFormComponent {
  @Input() responsiblePerson: ResponsiblePerson;
  @Input() isAddingResponsiblePerson = false;
  @Output() formSubmitted = new EventEmitter<ResponsiblePersonForm>();

  @ViewChild(DynamicFormErrorsSummaryComponent)
  dynamicFormErrorsSummaryComponent: DynamicFormErrorsSummaryComponent;

  private valueChangesSubscription: Subscription;

  companyOptions = [
    {
      label: 'Yes',
      value: true,
      inputConfig: {
        type: 'text',
        controlName: 'companyRegistrationNumber',
        label: 'Companies House registration number',
        validationMessages: {
          required: 'Enter a registration number (8 numbers or 2 letters and 6 numbers)',
          validRegistrationNumber: 'Companies House number not recognised; enter a valid number',
        },
      },
    },
    {
      label: 'No',
      value: false,
      inputConfig: {
        type: 'text',
        controlName: 'companyName',
        label: 'Organisation name',
        validationMessages: { required: 'Enter a organisation name' },
      },
    },
  ];

  consultantOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];
  form: FormGroup;
  ukPhoneNumberPattern = new RegExp('^([0-9]+( [0-9]+)+)$|^([0-9]+( [0-9]+)+)$|^\\+44\\s[0-9]+\\s[0-9]+\\s[0-9]+$');

  formUpdated = false;

  validationMessages = {
    firstName: {
      required: 'Enter a first name',
    },
    lastName: {
      required: 'Enter a last name',
    },
    jobTitle: {
      required: 'Enter a job title',
    },
    telephone1: {
      required: 'Enter a UK telephone number like 01632 960 001 or +44 808 157 0192 ',
      pattern: 'Enter a phone number in the correct format',
    },
    telephone2: {
      required: 'Enter a UK telephone number like 01632 960 001 or +44 808 157 0192 ',
      pattern: 'Enter a phone number in the correct format',
    },
    email: {
      required: 'Email address is required.',
    },
    companyRegistrationNumber: {
      required: 'Enter a registration number (8 numbers or 2 letters and 6 numbers)',
      validRegistrationNumber: 'Companies House number not recognised; enter a valid number',
    },
    companyName: {
      required: 'Enter a organisation name',
    },
    consultant: {
      required: 'Select yes if you are a consultant for your organisation',
    },
  };

  constructor(
    private companyHouseService: CompanyHouseService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['responsiblePerson']) {
      this.updateFormValues(changes['responsiblePerson'].currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  onChanges(): void {
    this.valueChangesSubscription = this.form.get('isCompanyHouseRegistered').valueChanges.subscribe(isCompanyHouseRegistered => {
      const companyNameControl = this.form.get('companyName');
      const companyRegNumControl = this.form.get('companyRegistrationNumber');
      if (isCompanyHouseRegistered.value === true) {
        companyNameControl.setValue(null);
        companyRegNumControl.setValidators([Validators.required]);
        companyNameControl.clearValidators();
      } else {
        companyNameControl.setValidators([Validators.required]);
        companyRegNumControl.setValue(null);
        companyRegNumControl.clearValidators();
      }
      companyNameControl.updateValueAndValidity();
      companyRegNumControl.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const isCompanyHouseRegistered = this.form.get('isCompanyHouseRegistered').value.value;
      isCompanyHouseRegistered ? this.checkRegistrationNumberValidity() : this.formSubmitted.emit(this.form.getRawValue());
    } else {
      this.markFormAsTouched();
    }
  }

  private checkRegistrationNumberValidity() {
    const companyRegNum = this.form.get('companyRegistrationNumber').value;
    this.companyHouseService
      .fetchInfoWithSicDescription(companyRegNum)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.formSubmitted.emit(this.form.getRawValue());
        },
        error: (error: Error) => {
          if (error.cause === 404) {
            this.dynamicFormErrorsSummaryComponent.addControlError(
              'companyRegistrationNumber',
              'validRegistrationNumber',
              this.validationMessages.companyRegistrationNumber.validRegistrationNumber
            );

            this.markFormAsTouched();
          }
        },
      });
  }

  markFormAsTouched() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
  }

  private initializeForm() {
    let selectedConsultantOption =
      this.consultantOptions.find(consultant => consultant.value === this.responsiblePerson?.consultant.value) ?? this.consultantOptions[1];

    let isCompanyHouseRegistered =
      this.companyOptions.find(company => company.value === this.responsiblePerson?.isCompanyHouseRegistered.value) ?? this.companyOptions[0];

    this.form = this.fb.group({
      firstName: [this.responsiblePerson?.firstName || '', Validators.required],
      lastName: [this.responsiblePerson?.lastName || '', Validators.required],
      companyName: [this.responsiblePerson?.organisation?.name || ''],
      companyRegistrationNumber: [this.responsiblePerson?.organisation?.registrationNumber || ''],
      consultant: [selectedConsultantOption, [Validators.required]],
      jobTitle: [this.responsiblePerson?.jobTitle || '', Validators.required],
      telephone1: ['', [Validators.required, Validators.pattern(this.ukPhoneNumberPattern)]],
      telephone2: ['', [Validators.pattern(this.ukPhoneNumberPattern)]],
      email: ['', this.isAddingResponsiblePerson ? Validators.required : []],
      isCompanyHouseRegistered: [isCompanyHouseRegistered, []],
    });

    this.onChanges();
  }

  private updateFormValues(responsiblePerson: ResponsiblePersonForm) {
    let selectedConsultantOption =
      this.consultantOptions?.find(consultant => consultant?.value === responsiblePerson?.consultant?.value) ?? this.consultantOptions[1];
    let isCompanyHouseRegistered =
      this.companyOptions.find(company => company.value === this.responsiblePerson?.isCompanyHouseRegistered.value) ?? this.companyOptions[0];

    this.form.patchValue({
      firstName: responsiblePerson?.firstName || '',
      lastName: responsiblePerson?.lastName || '',
      companyName: responsiblePerson?.organisation?.name || '',
      companyRegistrationNumber: responsiblePerson?.organisation?.registrationNumber || '',
      consultant: selectedConsultantOption,
      jobTitle: responsiblePerson?.jobTitle || '',
      telephone1: responsiblePerson?.telephone1 || '',
      telephone2: responsiblePerson?.telephone2 || '',
      isCompanyHouseRegistered: isCompanyHouseRegistered || this.companyOptions[0],
    });
  }
}
