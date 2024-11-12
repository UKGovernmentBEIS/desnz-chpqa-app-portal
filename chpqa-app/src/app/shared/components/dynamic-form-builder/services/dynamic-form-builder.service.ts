import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Injectable()
export class DynamicFormBuilderService {
  constructor() {}

  getOrganisationAddressFormFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'address1',
        type: 'govuk-input',
        templateOptions: {
          label: 'Address line 1',
          required: true,
          errorMessages: {
            required: 'Enter address line 1',
          },
          id: 'address1',
        },
      },
      {
        key: 'address2',
        type: 'govuk-input',
        templateOptions: {
          label: 'Address line 2 (optional)',
          id: 'address2',
        },
      },
      {
        key: 'town',
        type: 'govuk-input',
        templateOptions: {
          label: 'Town or city',
          required: true,
          errorMessages: {
            required: 'Enter town or city',
          },
          id: 'town',
        },
      },
      {
        key: 'county',
        type: 'govuk-input',
        templateOptions: {
          label: 'County (optional)',
          id: 'county',
        },
      },
      {
        key: 'postcode',
        type: 'govuk-input',
        templateOptions: {
          label: 'Postcode',
          required: true,
          pattern: '^(GIR ?0AA|[A-PR-UWYZ]([0-9][0-9]?|([A-HK-Y][0-9][0-9]?)|([0-9][A-HJKPSTUW])|([A-HK-Y][0-9][ABEHMNPRVWXY])) ?[0-9][ABD-HJLNP-UW-Z]{2})$',
          description: 'For example, B78 2ND',
          errorMessages: {
            required: 'Enter a postcode',
            pattern: 'Enter a valid postcode',
          },
          widthClass: 'govuk-!-width-one-quarter',
          id: 'postcode',
        },
      },
    ];
  }

  getAddressSearchFormFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'postcode',
        type: 'govuk-input',
        templateOptions: {
          label: 'Postcode',
          required: true,
          pattern: '^(GIR ?0AA|[A-PR-UWYZ]([0-9][0-9]?|([A-HK-Y][0-9][0-9]?)|([0-9][A-HJKPSTUW])|([A-HK-Y][0-9][ABEHMNPRVWXY])) ?[0-9][ABD-HJLNP-UW-Z]{2})$',
          description: 'For example, B78 2ND',
          errorMessages: {
            required: 'Enter a postcode',
            pattern: 'Enter a valid postcode'
          },
          id: 'postcode'
        }
      },
      {
        key: 'name',
        type: 'govuk-input',
        templateOptions: {
          label: 'Building number or name (optional)',
          id: 'name'
        }
      }
    ];
  }

  getPasswordFormFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroup: [
          {
            key: 'password',
            type: 'govuk-custom-password',
            templateOptions: {
              label: 'Create a password',
              required: true,
              minLength: 12,
              pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
              description: `
              <div class="govuk-hint govuk-hint--disabled">
                Your password must contain:
                <ul class="govuk-list govuk-list--bullet govuk-hint govuk-hint--disabled">
                  <li>at least 12 characters</li>
                  <li>at least one number</li>
                  <li>at least one symbol</li>
                </ul>
              </div>`,
              errorMessages: {
                required: 'Enter a password',
                minlength: 'Enter a password with at least 12 characters',
                pattern: 'Enter a password with at least one symbol and one number'
              },
              id: 'password'
            }
          },
          {
            key: 'passwordConfirmation',
            type: 'govuk-custom-password',
            templateOptions: {
              label: 'Re-enter your password',
              errorMessages: {
                required: 'Enter the password confirmation'
              },
              id: 'passwordConfirmation'
            },
            validators: {
              validation: ['fieldMatch'],
            }
          }
        ]
      }
    ];
  }

  getDynamicFormBuilderExampleFormInitialValues(): any {
    return {
      contactPreference: 'email',
      contactByEmail: 'example@example.com',
      eventName: null,
      moreDetail: 'This is a detailed description of the event.',
      location: 'london',
    };
  }

  getDynamicFormBuilderExampleFormFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'contactPreference',
        type: 'govuk-radio',
        templateOptions: {
          label: 'How would you prefer to be contacted?',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'text', label: 'Text message' },
          ],
          required: true,
          errorMessages: {
            required: 'Contact preference is required.',
          },
          id: 'contactPreference',
        },
      },
      {
        key: 'contactByEmail',
        type: 'govuk-input',
        hideExpression: 'model.contactPreference !== "email"',
        templateOptions: {
          label: 'Email address',
          type: 'email',
          required: true,
          errorMessages: {
            required: 'Email address is required.',
            pattern: 'Invalid email address.',
          },
          id: 'contactByEmail',
        },
      },
      {
        key: 'contactByPhone',
        type: 'govuk-input',
        hideExpression: 'model.contactPreference !== "phone"',
        templateOptions: {
          label: 'Phone number',
          type: 'tel',
          required: true,
          errorMessages: {
            required: 'Phone number is required.',
            pattern: 'Invalid phone number.',
          },
          id: 'contactByPhone',
        },
      },
      {
        key: 'contactByText',
        type: 'govuk-input',
        hideExpression: 'model.contactPreference !== "text"',
        templateOptions: {
          label: 'Mobile phone number',
          type: 'tel',
          required: true,
          errorMessages: {
            required: 'Mobile phone number is required.',
            pattern: 'Invalid mobile phone number.',
          },
          id: 'contactByText',
        },
      },
      {
        key: 'eventName',
        type: 'govuk-input',
        templateOptions: {
          label: 'What is the name of the event?',
          required: true,
          errorMessages: {
            required: 'Event name is required.',
          },
          id: 'eventName',
        },
      },
      {
        key: 'moreDetail',
        type: 'govuk-textarea',
        templateOptions: {
          label: 'Can you provide more detail?',
          rows: 5,
          required: true,
          errorMessages: {
            required: 'More detail is required.',
          },
          id: 'moreDetail',
        },
      },
      {
        key: 'location',
        type: 'govuk-select',
        templateOptions: {
          label: 'Choose location',
          options: [
            { value: 'choose', label: 'Choose location' },
            { value: 'eastmidlands', label: 'East Midlands' },
            { value: 'eastofengland', label: 'East of England' },
            { value: 'london', label: 'London' },
            { value: 'northeast', label: 'North East' },
            { value: 'northwest', label: 'North West' },
            { value: 'southeast', label: 'South East' },
            { value: 'southwest', label: 'South West' },
            { value: 'westmidlands', label: 'West Midlands' },
            { value: 'yorkshire', label: 'Yorkshire and the Humber' },
          ],
          required: true,
          errorMessages: {
            required: 'Location is required.',
          },
          id: 'location',
        },
      },
    ];
  }

  getRegistrationEmailFormFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'email',
        type: 'govuk-input',
        templateOptions: {
          label: 'Email address',
          required: true,
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$',
          errorMessages: {
            required: 'Enter an email address',
            pattern: 'Enter a valid email address',
          },
          id: 'email',
        },
      },
    ];
  }

  getRegistrationEmailFormInitialValues(email: string) {
    return {
      email: email ?? '',
    };
  }

  getResponsiblePersonFormFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'firstName',
        type: 'govuk-input',
        props: {
          label: 'First name',
          required: true,
          errorMessages: {
            required: 'Enter first name',
          },
          id: 'firstName',
        },
      },
      {
        key: 'lastName',
        type: 'govuk-input',
        props: {
          label: 'Last name',
          required: true,
          errorMessages: {
            required: 'Enter last name',
          },
          id: 'lastName',
        },
      },
      {
        key: 'isCompanyHouseRegistered',
        type: 'govuk-complex-radio',
        props: {
          label: 'Is your organisation registered with Companies House?',
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          required: true,
          id: 'isCompanyHouseRegistered',
        },
        fieldGroup: [
          {
            fieldGroup: [
              {
                key: 'companyRegistrationNumber',
                type: 'govuk-input',
                props: {
                  label: 'Companies House registration number',
                  required: true,
                  errorMessages: {
                    required: 'Enter Companies House registration number',
                  },
                  id: 'companyRegistrationNumber',
                },
              },
            ],
            hideExpression: '!model.isCompanyHouseRegistered',
          },
          {
            fieldGroup: [
              {
                key: 'companyName',
                type: 'govuk-input',
                props: {
                  label: 'Organisation name',
                  required: true,
                  errorMessages: {
                    required: 'Enter organisation name',
                  },
                  id: 'companyName',
                },
              },
            ],
            hideExpression: 'model.isCompanyHouseRegistered',
          },
        ],
      },
      {
        key: 'consultant',
        type: 'govuk-radio',
        props: {
          label: 'Are you a consultant?',
          description: 'A consultant can create schemes for different organisations',
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
          required: true,
          id: 'consultant',
        },
      },
      {
        key: 'jobTitle',
        type: 'govuk-input',
        props: {
          label: 'Job title',
          required: true,
          errorMessages: {
            required: 'Enter job title',
          },
          id: 'jobTitle',
        },
      },
      {
        key: 'telephone1',
        type: 'govuk-input',
        props: {
          label: 'Telephone number',
          type: 'number',
          maxLength: 10,
          required: true,
          errorMessages: {
            required: 'Enter telephone number',
            maxlength: 'Enter a valid telephone number',
          },
          id: 'telephone1',
        },
      },
      {
        key: 'telephone2',
        type: 'govuk-input',
        props: {
          label: 'Mobile number (optional)',
          type: 'number',
          maxLength: 10,
          id: 'telephone2',
        },
      },
    ];
  }

  getResponsiblePersonFormInitialValues(responsiblePerson: any) {
    return {
      firstName: responsiblePerson?.firstName || '',
      lastName: responsiblePerson?.lastName || '',
      companyName: responsiblePerson?.organisation?.name || '',
      companyRegistrationNumber: responsiblePerson?.organisation?.registrationNumber || '',
      consultant: responsiblePerson?.consultant || false,
      jobTitle: responsiblePerson?.jobTitle || '',
      telephone1: responsiblePerson?.telephone1 || '',
      telephone2: responsiblePerson?.telephone2 || '',
      isCompanyHouseRegistered: responsiblePerson?.isCompanyHouseRegistered || true,
    };
  }
}
