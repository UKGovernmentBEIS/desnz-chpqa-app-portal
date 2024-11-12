import { createAction, props } from '@ngrx/store';

export enum RegistrationRequestActionTypes {
  SEND_REGISTRATION_EMAIL = '[Registration Request] Send registration email',
  SEND_REGISTRATION_EMAIL_SUCCESS = '[Registration Request] Send registration email success',
  SEND_REGISTRATION_EMAIL_FAILURE = '[Registration Request] Send registration email failure',
  RESET_STATE = '[Registration Request] Reset state',
}

export const sendRegistrationEmail = createAction(
  RegistrationRequestActionTypes.SEND_REGISTRATION_EMAIL,
  props<{ email: string }>()
);

export const sendRegistrationEmailSuccess = createAction(
  RegistrationRequestActionTypes.SEND_REGISTRATION_EMAIL_SUCCESS
);

export const sendRegistrationEmailFailure = createAction(
  RegistrationRequestActionTypes.SEND_REGISTRATION_EMAIL_FAILURE
);

export const resetState = createAction(
  RegistrationRequestActionTypes.RESET_STATE
);
