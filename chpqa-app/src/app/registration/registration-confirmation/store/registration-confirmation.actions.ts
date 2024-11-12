import { createAction, props } from '@ngrx/store';
import { Address, Organisation, ResponsiblePersonForm, SearchAddressCriteria } from '@shared/models';

export enum RegistrationConfirmationActionTypes {
  SET_RESPONSIBLE_PERSON = '[Registration Confirmation] Set responsible person',
  SET_SEARCH_ADDRESS_CRITERIA = '[Registration Confirmation] Seat search address criteria',
  SET_PASSWORD = '[Registration Confirmation] Set password',
  SET_EMAIL = '[Registration Confirmation] Set email',
  SUBMIT_RESPONSIBLE_PERSON = '[Registration Confirmation] Submit',
  SUBMIT_RESPONSIBLE_PERSON_SUCCESS = '[Registration Confirmation] Submit responsible person success',
  SUBMIT_RESPONSIBLE_PERSON_FAILURE = '[Registration Confirmation] Submit responsible person success',
  RESET_STATE = '[Registration Confirmation] Reset state',
  SET_ORGANISATION_ADDRESS = '[Registration Confirmation] Set organisation address',
  NAVIGATE_TO = '[Registration Confirmation] Navigate to',
  NAVIGATE_TO_ENTER_RESPONSIBLE_PERSON_FORM = '[Registration Confirmation] Navigate to responsible person form',
  NAVIGATE_TO_CONFIRM_ORGANISATION_ADDRESS = '[Registration Confirmation] Navigate to confirm organisation address',
  NAVIGATE_TO_SEARCH_ORGANISATION_ADDRESS = '[Registration Confirmation] Navigate to search organisation address',
  NAVIGATE_TO_SELECT_ORGANISATION_ADDRESS = '[Registration Confirmation] Navigate to select organisation address',
  NAVIGATE_TO_CHOOSE_PASSWORD_FORM = '[Registration Confirmation] Navigate to site details form',
  NAVIGATE_TO_LEGAL_STATEMENT = '[Registration Confirmation] Navigate to legal statemen',
  NAVIGATE_TO_CHECK_ANSWERS = '[Registration Confirmation] Navigate to check answers',
  NAVIGATE_TO_SUCCESS = '[Registration Confirmation] Navigate to success',
  TOKEN_VERIFICATION = '[Registration Confirmation] Token Verification',
  TOKEN_VERIFICATION_SUCCESS = '[Registration Confirmation] Token Verification Success',
  TOKEN_VERIFICATION_FAILURE = '[Registration Confirmation] Token Verification Failure',
  FETCH_COMPANY_INFO = '[Registration Confirmation] Fetch Company Info',
  FETCH_COMPANY_INFO_SUCCESS = '[Registration Confirmation] Fetch Company Info Success',
  FETCH_COMPANY_INFO_FAILURE = '[Registration Confirmation] Fetch Company Info Failure',
  SET_AGREE_TO_TERMS = '[Registration Confirmation] Set agree to terms',
}

export const setResponsiblePerson = createAction(
  RegistrationConfirmationActionTypes.SET_RESPONSIBLE_PERSON,
  props<{ responsiblePersonForm: ResponsiblePersonForm }>()
);

export const setSearchAddressCriteria = createAction(
  RegistrationConfirmationActionTypes.SET_SEARCH_ADDRESS_CRITERIA,
  props<{ searchAddressCriteria: SearchAddressCriteria }>()
);

export const setPassword = createAction(
  RegistrationConfirmationActionTypes.SET_PASSWORD,
  props<{ password: string }>()
);

export const setEmail = createAction(
  RegistrationConfirmationActionTypes.SET_EMAIL,
  props<{ email: string }>()
);

export const setOrganisationAddress = createAction(
  RegistrationConfirmationActionTypes.SET_ORGANISATION_ADDRESS,
  props<{ address: Address }>()
);

export const submitResponsiblePerson = createAction(RegistrationConfirmationActionTypes.SUBMIT_RESPONSIBLE_PERSON);

export const resetState = createAction(
  RegistrationConfirmationActionTypes.RESET_STATE
);

export const navigateTo = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO,
  props<{ url: string }>()
);

export const navigateToResponsiblePersonForm = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_ENTER_RESPONSIBLE_PERSON_FORM
);

export const navigateToConfirmOrganisationAddress = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_CONFIRM_ORGANISATION_ADDRESS
);

export const navigateToSearchOrganisationAddress = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_SEARCH_ORGANISATION_ADDRESS
);

export const navigateToSelectOrganisationAddress = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_SELECT_ORGANISATION_ADDRESS
);

export const navigateToChoosePasswordForm = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_CHOOSE_PASSWORD_FORM
);

export const navigateToCheckAnswers = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_CHECK_ANSWERS
);
export const navigateToLegalStatement = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_LEGAL_STATEMENT
);

export const navigateToSuccess = createAction(
  RegistrationConfirmationActionTypes.NAVIGATE_TO_SUCCESS
);

export const tokenVerification = createAction(
  RegistrationConfirmationActionTypes.TOKEN_VERIFICATION,
  props<{ token: string; email: string }>()
);

export const tokenVerificationSuccess = createAction(
  RegistrationConfirmationActionTypes.TOKEN_VERIFICATION_SUCCESS
);

export const tokenVerificationFailure = createAction(
  RegistrationConfirmationActionTypes.TOKEN_VERIFICATION_FAILURE,
  props<{ error: any }>()
);

export const fetchCompanyInfo = createAction(
  RegistrationConfirmationActionTypes.FETCH_COMPANY_INFO,
  props<{ companyRegistrationNumber: string }>()
);

export const fetchCompanyInfoSuccess = createAction(
  RegistrationConfirmationActionTypes.FETCH_COMPANY_INFO_SUCCESS,
  props<{ organisation: Organisation }>()
);

export const fetchCompanyInfoFailure = createAction(
  RegistrationConfirmationActionTypes.FETCH_COMPANY_INFO_FAILURE,
  props<{ error: any }>()
);

export const setAgreeToTerms = createAction(
  RegistrationConfirmationActionTypes.SET_AGREE_TO_TERMS,
  props<{ agreeToTerms: boolean }>()
);