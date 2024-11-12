import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { REGISTRATION_REQUEST_ROUTES } from './registration-request-routes';
import { StoreModule } from '@ngrx/store';
import * as fromRegistrationRequest from './store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(REGISTRATION_REQUEST_ROUTES),
    StoreModule.forFeature(
      fromRegistrationRequest.registrationRequestFeatureKey,
      fromRegistrationRequest.reducer
    ),
    EffectsModule.forFeature([
      fromRegistrationRequest.RegistrationRequestEffects,
    ]),
  ],
})
export class RegistrationRequestModule {}
