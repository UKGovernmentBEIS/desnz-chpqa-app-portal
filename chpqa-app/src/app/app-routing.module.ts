import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '@shared/guards';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    canActivate: [],
    loadComponent: () => import('./components/landing-page/landing-page.component').then(mod => mod.LandingPageComponent),
  },
  {
    path: 'request-task-page',
    canActivate: [LoginGuard],
    loadComponent: () => import('./components/request-task-page/pages/dashboard/responsible-person-dashboard.component').then(mod => mod.ResponsiblePersonDashboardComponent),
  },
  {
    path: 'registration-request',
    canActivate: [],
    loadChildren: () => import('./registration/registration-request/registration-request.module').then(mod => mod.RegistrationRequestModule),
  },
  {
    path: 'registration-confirmation',
    canActivate: [],
    loadChildren: () => import('./registration/registration-confirmation/registration-confirmation.module').then(mod => mod.RegistrationConfirmationModule),
  },
  {
    path: 'privacy',
    canActivate: [],
    loadComponent: () => import('./components/privacy/privacy.component').then(mod => mod.PrivacyComponent),
  },
  {
    path: 'cookies',
    canActivate: [],
    loadComponent: () => import('./components/cookie-settings/cookie-settings-container.component').then(mod => mod.CookieSettingsContainerComponent),
  },
  {
    path: 'accessibility',
    canActivate: [],
    loadComponent: () => import('./components/accessibility/accessibility.component').then(mod => mod.AccessibilityComponent),
  },
  {
    path: 'contact',
    canActivate: [],
    loadComponent: () => import('./components/contact/contact.component').then(mod => mod.ContactComponent),
  },
  {
    path: 'scheme-registration',
    canActivate: [],
    loadChildren: () => import('./tasks/scheme-registration/scheme-registration.module').then(mod => mod.SchemeRegistrationModule),
  },
  {
    path: 'set-scheme-form-wizard',
    canActivate: [],
    loadChildren: () => import('./tasks/set-scheme-form-wizard/form-wizard.module').then(mod => mod.FormWizardModule),
  },
  {
    path: 'form-submission',
    canActivate: [],
    loadChildren: () => import('./tasks/form-submission/form-submission.module').then(mod => mod.FormSubmissionModule),
  },
  {
    path: 'assessor',
    loadChildren: () => import('./features/assessor/assessor.module').then(m => m.AssessorModule),
    canActivate: [],
  },
  {
    path: 'sign-out',
    loadComponent: () => import('./auth/pages/sign-out.page.component').then(mod => mod.SignedOutComponent),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(APP_ROUTES, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
