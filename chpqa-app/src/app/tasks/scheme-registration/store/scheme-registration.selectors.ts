import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SchemeRegistrationStoreType } from './scheme-registration.reducer';

export const selectRequest = createFeatureSelector<SchemeRegistrationStoreType>(
  'scheme-registration'
);

// TODO maybe better approach
// export const selectSchemeRegistration = (state: SchemeRegistration) => state;
// export const selectSchemeName = createSelector(
//   selectSchemeRegistration,
//   state => state.name
// );

export const selectScheme = createSelector(selectRequest, state => state);

export const selectSchemeOrganisation = createSelector(
  selectRequest,
  state => state.company
);

export const selectSchemeName = createSelector(
  selectRequest,
  state => state.name
);

export const selectSiteSearchCriteria = createSelector(
  selectRequest,
  state => state.searchAddress
);

export const selectManuallyInsertedSiteAddress = createSelector(
  selectRequest,
  state => state.manuallyInsertedSiteAddress
);

export const selectSite = createSelector(selectRequest, state => state.site);

export const selectCompany = createSelector(
  selectRequest,
  state => state.company
);

export const selectResponsiblePerson = createSelector(
  selectRequest,
  state => state.responsiblePerson
);

export const selectSiteContactDetails = createSelector(
  selectRequest,
  state => state.site.areYouTheSiteContactPerson
);

export const selectContactPerson = createSelector(
  selectRequest,
  state => state.site.contactPerson
);

export const selectSicCode = createSelector(
  selectRequest,
  state => state.sicCode
);

export const selectEconomicSector = createSelector(
  selectRequest,
  state => state.econSector
);

export const selectEconomicSubSector = createSelector(
  selectRequest,
  state => state.econSubSector
);
