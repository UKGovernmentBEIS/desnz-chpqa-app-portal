import { createAction, props } from '@ngrx/store';

export enum AuthActionTypes {
  SET_KEYCLOAK_USER = '[Keycloak] Set User',
  KEYCLOAK_LOGIN = '[Keycloak] Login',
  KEYCLOAK_LOGIN_SUCCESS = '[Keycloak] Login Success',
  KEYCLOAK_LOGIN_FAIL = '[Keycloak] Login Fail',
  KEYCLOAK_LOGOUT = '[Keycloak] Logout',
  KEYCLOAK_LOGOUT_SUCCESS = '[Keycloak] Logout Success',
  KEYCLOAK_LOGOUT_FAIL = '[Keycloak] Logout Fail',
  AUTH_LOGIN = '[Auth] Login',
  AUTH_LOGIN_SUCCESS = '[Auth] Login Success',
  AUTH_FETCH_USER = '[Auth] Fetch User',
  AUTH_SET_USER = '[Auth] Set User',
  // AUTH_LOAD_USER = '[Auth] Load User',
  // AUTH_LOAD_USER_SUCCESS = '[Auth] Load User Success',
  // AUTH_LOAD_USER_FAIL = '[Auth] Load User Failure',
}

export const setKeycloakUser = createAction(
  AuthActionTypes.SET_KEYCLOAK_USER,
  props<{ keycloakUser: any }>()
);

export const keycloakLogin = createAction(
  AuthActionTypes.KEYCLOAK_LOGIN,
  props<{ redirectUri: string }>()
);

export const keycloakLoginSuccess = createAction(
  AuthActionTypes.KEYCLOAK_LOGIN_SUCCESS
);

export const keycloakLoginFail = createAction(
  AuthActionTypes.KEYCLOAK_LOGIN_FAIL,
  props<{
    error: string;
  }>()
);

export const keycloakLogout = createAction(
  AuthActionTypes.KEYCLOAK_LOGOUT,
  props<{
    redirectUri?: string;
  }>()
);

export const keycloakLogoutSuccess = createAction(
  AuthActionTypes.KEYCLOAK_LOGOUT_SUCCESS
);

export const keycloakLogoutFail = createAction(
  AuthActionTypes.KEYCLOAK_LOGOUT_FAIL,
  props<{
    error: string;
  }>()
);

export const login = createAction(
  AuthActionTypes.AUTH_LOGIN,
  props<{ email: string }>()
);

export const loginSuccess = createAction(
  AuthActionTypes.AUTH_LOGIN_SUCCESS
);

export const fetchUser = createAction(AuthActionTypes.AUTH_FETCH_USER);

export const setUser = createAction(
  AuthActionTypes.AUTH_SET_USER,
  props<{ user: any }>()
);
