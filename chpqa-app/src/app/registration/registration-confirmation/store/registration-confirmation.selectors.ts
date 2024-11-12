import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  RegistrationConfirmationState,
  registrationConfirmationFeatureKey,
} from './registration-confirmation.reducer';

const selectRegistrationConfirmation =
  createFeatureSelector<RegistrationConfirmationState>(
    registrationConfirmationFeatureKey
  );

export const selectRegisteredResponsiblePerson = createSelector(
  selectRegistrationConfirmation,
  state => state.responsiblePerson
);

export const selectSearchAddressCriteria = createSelector(
  selectRegistrationConfirmation,
  state => state.searchAddressCriteria
);

export const selectPassword = createSelector(
  selectRegistrationConfirmation,
  state => state.password
);

export const selectEmail = createSelector(
  selectRegistrationConfirmation,
  state => state.email
);

export const selectOrganisation = createSelector(
  selectRegistrationConfirmation,
  state => state?.responsiblePerson?.organisation
);

export const selectOrganisationAddress = createSelector(
  selectRegistrationConfirmation,
  state => ({
    address1: state?.responsiblePerson?.organisation?.address1,
    town: state?.responsiblePerson?.organisation?.town,
    county: state?.responsiblePerson?.organisation?.county,
    postcode: state?.responsiblePerson?.organisation?.postcode,
  })
);

export const selectAgreeToTerms = createSelector(
  selectRegistrationConfirmation,
  state => state.agreeToTerms
);
