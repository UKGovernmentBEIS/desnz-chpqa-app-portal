import { Routes } from '@angular/router';
import { FormWizardPath } from './models/form-wizard-path.model';

export const FORM_WIZARD_ROUTES: Routes = [
  {
    path: ':schemeId',
    children: [
      {
        path: FormWizardPath.BEFORE_START,
        loadComponent: () =>
          import('./components/before-start/before-start.component').then(
            mod => mod.BeforeStartComponent
          ),
      },
      {
        path: FormWizardPath.CHOOSE_OPERATIONAL,
        loadComponent: () =>
          import(
            './components/choose-operational/choose-operational.component'
          ).then(mod => mod.ChooseOperationalComponent),
      },
      {
        path: FormWizardPath.CHOOSE_CRITERIA,
        loadComponent: () =>
          import('./components/choose-criteria/choose-criteria.component').then(
            mod => mod.ChooseCriteriaComponent
          ),
      },
    ],
  },
];
