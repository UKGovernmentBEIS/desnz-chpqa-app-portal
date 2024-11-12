import { Routes } from '@angular/router';
import { RegistrationConfirmationPath } from './models/registration-confirmation-path.model';
import { ConfirmOrgAddressGuard } from './guards/confirm-organisation-address.guard';

export const REGISTRATION_CONFIRMATION_ROUTES: Routes = [
  {
    path: RegistrationConfirmationPath.EMAIL_CONFIRMATION_SUCCESS,
    canDeactivate: [],
    loadComponent: () =>
      import('./components/email-confirmation-success/email-confirmation-success.component').then(mod => mod.EmailConfirmationSuccessComponent),
  },
  {
    path: RegistrationConfirmationPath.ENTER_RESPONSIBLE_PERSON,
    canDeactivate: [],
    loadComponent: () =>
      import('./components/enter-responsible-person-form/enter-responsible-person-form.component').then(mod => mod.EnterResponsiblePersonFormComponent),
  },
  {
    path: RegistrationConfirmationPath.CHOOSE_PASSWORD,
    canDeactivate: [],
    loadComponent: () => import('./components/choose-password-form/choose-password-form.component').then(mod => mod.ChoosePasswordFormComponent),
  },
  {
    path: RegistrationConfirmationPath.CHECK_ANSWERS,
    canDeactivate: [],
    loadComponent: () => import('./components/check-answers/check-answers.component').then(mod => mod.CheckAnswersComponent),
  },
  {
    path: RegistrationConfirmationPath.SUCCESS,
    canDeactivate: [],
    loadComponent: () => import('./components/create-signin-success/create-signin-success.component').then(mod => mod.CreateSigninSuccessComponent),
  },
  {
    path: RegistrationConfirmationPath.CONFIRM_ORGANISATION_ADDRESS,
    canActivate: [ConfirmOrgAddressGuard],
    loadComponent: () =>
      import('./components/confirm-organisation-address/confirm-organisation-address.component').then(mod => mod.ConfirmOrganisationAddressComponent),
  },
  {
    path: RegistrationConfirmationPath.SEARCH_ORGANISATION_ADDRESS,
    // canDeactivate: [],
    loadComponent: () =>
      import('./components/search-organisation-address/search-organisation-address.component').then(mod => mod.SearchOrganisationAddressComponent),
  },
  {
    path: RegistrationConfirmationPath.SELECT_ORGANISATION_ADDRESS,
    // canDeactivate: [],
    loadComponent: () =>
      import('./components/select-organisation-address/select-organisation-address.component').then(mod => mod.SelectOrganisationAddressComponent),
  },
  {
    path: RegistrationConfirmationPath.ADD_ORGANISATION_ADDRESS,
    // canDeactivate: [],
    loadComponent: () => import('./components/add-organisation-address/add-organisation-address.component').then(mod => mod.AddOrganisationAddressComponent),
  },
  {
    path: RegistrationConfirmationPath.LEGAL_STATEMENT,
    // canDeactivate: [],
    loadComponent: () => import('./components/legal-statement/legal-statement.component').then(mod => mod.LegalStatementComponent),
  },
  {
    path: RegistrationConfirmationPath.TERMS_CONDITIONS,
    // canDeactivate: [],
    loadComponent: () => import('./components/terms-conditions/terms-conditions.component').then(mod => mod.TermsConditionsComponent),
  },
];
