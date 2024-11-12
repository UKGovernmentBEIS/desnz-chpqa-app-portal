import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { KeycloakUser } from './auth.model';

export const authFeatureKey = 'auth';

export interface AuthState {
  isAuthenticated: boolean;
  keycloakUser: KeycloakUser;
  user: any;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  keycloakUser: null,
  user: null,
};

export const reducer = createReducer(
  initialState,

  on(AuthActions.setKeycloakUser, (state, { keycloakUser }) => ({
    ...state,
    isAuthenticated: true,
    keycloakUser: keycloakUser,
  })),

  on(AuthActions.setUser, (state, { user }) => ({
    ...state,
    user: user,
  }))
);
