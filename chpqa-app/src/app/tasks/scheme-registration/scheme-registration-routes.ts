import { Routes } from '@angular/router';
import { SchemeRegistartiondPath } from './models/scheme-registration-path.model';
import { SicOrEconomicSectorGuard } from './guards/sic-or-economic-sector.guard';
import { EconomicSubSectorGuard } from './guards/economic-sub-sector.guard';

export const SCHEME_REGISTRATION_ROUTES: Routes = [
  {
    path: SchemeRegistartiondPath.BEFORE_REGISTRATION_STARTS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () =>
      import('./components/before-registration-starts/before-registration-starts.component').then(mod => mod.BeforeRegistrationStartsComponent),
  },
  {
    path: SchemeRegistartiondPath.ENTER_SCHEME_NAME,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/enter-scheme-name/enter-scheme-name.component').then(mod => mod.EnterSchemeNameComponent),
  },
  {
    path: SchemeRegistartiondPath.SELECT_SIC_CODE,
    canActivate: [SicOrEconomicSectorGuard],
    loadComponent: () => import('./components/select-sic-code/select-sic-code.component').then(mod => mod.SelectSicCodeComponent),
  },
  {
    path: SchemeRegistartiondPath.SELECT_ECONOMIC_SECTOR,
    canActivate: [SicOrEconomicSectorGuard],
    loadComponent: () =>
      import('./components/economic-sector/components/select-economic-sector/select-economic-sector.component').then(mod => mod.SelectEconomicSectorComponent),
  },
  {
    path: SchemeRegistartiondPath.SELECT_ECONOMIC_SUB_SECTOR,
    canActivate: [EconomicSubSectorGuard],
    loadComponent: () =>
      import('./components/economic-sector/components/select-economic-sub-sector/select-economic-sub-sector.component').then(
        mod => mod.SelectEconomicSubSectorComponent
      ),
  },
  {
    path: SchemeRegistartiondPath.SEARCH_SITE_ADDRESS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/search-site-address/search-site-address.component').then(mod => mod.SearchSiteAddressComponent),
  },
  {
    path: SchemeRegistartiondPath.SELECT_SITE_ADDRESS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/select-site-address/select-site-address.component').then(mod => mod.SelectSiteAddressComponent),
  },
  {
    path: SchemeRegistartiondPath.ADD_SITE_ADDRESS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/add-site-address/add-site-address.component').then(mod => mod.AddSiteAddressComponent),
  },
  {
    path: SchemeRegistartiondPath.CONFIRM_SITE_ADDRESS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/confirm-site-address/confirm-site-address.component').then(mod => mod.ConfirmSiteAddressComponent),
  },
  {
    path: SchemeRegistartiondPath.SITE_CONTACT_DETAILS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/site-contact-details/site-contact-details.component').then(mod => mod.SiteContactDetailsComponent),
  },
  {
    path: SchemeRegistartiondPath.NEW_SITE_CONTACT_DETAILS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/new-site-contact-details/new-site-contact-details.component').then(mod => mod.NewSiteContactDetailsComponent),
  },
  {
    path: SchemeRegistartiondPath.EXISTING_SITE_CONTACT_DETAILS,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () =>
      import('./components/confirm-existing-site-contact/confirm-existing-site-contact.component').then(mod => mod.ConfirmExistingSiteContactComponent),
  },
  {
    path: SchemeRegistartiondPath.ADD_SITE_CONTACT,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/add-site-contact/add-site-contact.component').then(mod => mod.AddSiteContactComponent),
  },
  {
    path: SchemeRegistartiondPath.ADD_NEW_SITE_CONTACT,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/add-new-site-contact/add-new-site-contact.component').then(mod => mod.AddNewSiteContactComponent),
  },
  {
    path: SchemeRegistartiondPath.CONFIRM_SITE_CONTACT,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/confirm-site-contact/confirm-site-contact.component').then(mod => mod.ConfirmSiteContactComponent),
  },
  {
    path: SchemeRegistartiondPath.CONFIRMATION,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/confirmation/confirmation.component').then(mod => mod.ConfirmationComponent),
  },
  {
    path: SchemeRegistartiondPath.SUMMARY,
    // canDeactivate: [schemeRegistartiondGuard],
    loadComponent: () => import('./components/summary/summary.component').then(mod => mod.SummaryComponent),
  },
];
