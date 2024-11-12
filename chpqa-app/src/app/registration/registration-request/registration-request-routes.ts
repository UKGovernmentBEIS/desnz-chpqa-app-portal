import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationRequestPath } from './models/registration-request-path.model';

export const REGISTRATION_REQUEST_ROUTES: Routes = [
  {
    path: RegistrationRequestPath.CREATE_SIGN_IN,
    canDeactivate: [],
    loadComponent: () =>
      import('./components/create-sign-in/create-sign-in.component').then(
        mod => mod.CreateSignInComponent
      ),
  },
  {
    path: RegistrationRequestPath.REGISTRATION_EMAIL,
    canDeactivate: [],
    loadComponent: () =>
      import(
        './components/registration-email/registration-email.component'
      ).then(mod => mod.RegistrationEmailComponent),
  },
  {
    path: RegistrationRequestPath.VERIFICATION,
    canDeactivate: [],
    loadComponent: () =>
      import('./components/verification/verification.component').then(
        mod => mod.VerificationComponent
      ),
  },
];
