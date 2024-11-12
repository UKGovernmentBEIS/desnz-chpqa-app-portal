import { createReducer, on } from '@ngrx/store';
import * as RegistrationRequestActions from './registration-request.actions';

export const registrationRequestFeatureKey = 'registration-request';

export interface RegistrationRequestState {
  email: string;
}

export const initialState: RegistrationRequestState = {
  email: null
};

export const reducer = createReducer(
  initialState,
  on(RegistrationRequestActions.resetState, state => ({
    ...state,
    initialState,
  })),
  on(
    RegistrationRequestActions.sendRegistrationEmail,
    (state, { email }) => ({
      ...state,
      email,
    })
  ),
  on(
    RegistrationRequestActions.sendRegistrationEmailSuccess, state => ({
      ...state,
    })),
);
