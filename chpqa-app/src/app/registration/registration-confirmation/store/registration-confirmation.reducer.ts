import { createReducer, on } from '@ngrx/store';
import { ResponsiblePerson, SearchAddressCriteria } from '@shared/models';
import * as RegistrationConfirmationActions from './registration-confirmation.actions';
export const registrationConfirmationFeatureKey = 'registration-confirmation';

export interface RegistrationConfirmationState {
  responsiblePerson: ResponsiblePerson;
  searchAddressCriteria: SearchAddressCriteria;
  password: string;
  email: string;
  agreeToTerms: boolean;
}

export const initialState: RegistrationConfirmationState = {
  responsiblePerson: null,
  searchAddressCriteria: {
    postcode: null,
    nameOrBuildingNumber: null
  },
  password: null,
  email: null,
  agreeToTerms: null
};

export const reducer = createReducer(
  initialState,
  on(RegistrationConfirmationActions.resetState, state => ({
    ...state,
    ...initialState,
  })),
  on(
    RegistrationConfirmationActions.setResponsiblePerson,
    (state, { responsiblePersonForm }) => {
      const {
        companyName,
        companyRegistrationNumber,
        ...newResponsiblePersonData
      } = responsiblePersonForm;

      return {
        ...state,
        responsiblePerson: {
          ...state.responsiblePerson,
          ...newResponsiblePersonData,
        },
      };
    }
  ),
  on(
    RegistrationConfirmationActions.setSearchAddressCriteria,
    (state, { searchAddressCriteria }) => ({
    ...state,
    searchAddressCriteria: {
      ...searchAddressCriteria
    },
  })),
  on(
    RegistrationConfirmationActions.fetchCompanyInfoSuccess,
    (state, action) => ({
      ...state,
      responsiblePerson: {
        ...state.responsiblePerson,
        organisation: action.organisation,
      },
    })
  ),
  on(RegistrationConfirmationActions.setEmail, (state, action) => ({
    ...state,
    email: action.email,
  })),
  on(RegistrationConfirmationActions.setPassword, (state, action) => ({
    ...state,
    password: action.password,
  })),
  on(
    RegistrationConfirmationActions.setOrganisationAddress,
    (state, { address }) => ({
      ...state,
      responsiblePerson: {
        ...state.responsiblePerson,
        organisation: {
          ...state.responsiblePerson?.organisation,
          address1: address.address1,
          address2: address.address2,
          town: address.town,
          county: address.county,
          postcode: address.postcode,
        },
      },
    })
  ),
  on(
    RegistrationConfirmationActions.setAgreeToTerms,
    (state, { agreeToTerms }) => ({
      ...state,
      agreeToTerms
    })
  )
);

