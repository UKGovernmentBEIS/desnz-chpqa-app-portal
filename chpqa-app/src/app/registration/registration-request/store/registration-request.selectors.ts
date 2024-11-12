import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RegistrationRequestState } from './registration-request.reducer';

export const selectRequest =
  createFeatureSelector<RegistrationRequestState>('registration-request');

export const selectEmail = createSelector(
  selectRequest,
  state => state.email
);
