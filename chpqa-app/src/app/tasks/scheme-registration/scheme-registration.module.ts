import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SCHEME_REGISTRATION_ROUTES } from './scheme-registration-routes';
import { StoreModule } from '@ngrx/store';
import * as fromSchemeRegistration from './store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(SCHEME_REGISTRATION_ROUTES),
    StoreModule.forFeature(
      fromSchemeRegistration.registrationConfirmationFeatureKey,
      fromSchemeRegistration.reducer
    ),
    EffectsModule.forFeature([
      fromSchemeRegistration.SchemeRegistrationEffects,
    ]),
  ],
})
export class SchemeRegistrationModule {}
