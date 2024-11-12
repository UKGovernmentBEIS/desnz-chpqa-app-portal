import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { REGISTRATION_CONFIRMATION_ROUTES } from './registration-confirmation-routes';
import { StoreModule } from '@ngrx/store';
import {
  reducer,
  registrationConfirmationFeatureKey,
  RegistrationConfirmationEffects,
} from './store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(REGISTRATION_CONFIRMATION_ROUTES),
    StoreModule.forFeature(registrationConfirmationFeatureKey, reducer),
    EffectsModule.forFeature([RegistrationConfirmationEffects]),
  ],
})
export class RegistrationConfirmationModule {}
