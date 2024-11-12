import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuth = createFeatureSelector<AuthState>('auth');

export const isAuthenticated = createSelector(
  selectAuth,
  (state: AuthState) => state?.isAuthenticated
);

export const selectKeycloakUser = createSelector(
  selectAuth,
  (state: AuthState) => state?.keycloakUser
);

export const selectUser = createSelector(
  selectAuth,
  (state: AuthState) => state?.user
);

export const selectUserId = createSelector(
  selectAuth,
  (state: AuthState) => state?.user?.id
);

export const selectEmail = createSelector(
  selectAuth,
  (state: AuthState) => state?.keycloakUser?.email
);

export const selectFullName = createSelector(
  selectUser,
  (user: any) => {
    const firstName = user?.firstName;
    const lastName = user?.lastName;
    if(!firstName && !lastName) {
      return null;
    }
    return `${firstName} ${lastName}`.trim();
  }
);