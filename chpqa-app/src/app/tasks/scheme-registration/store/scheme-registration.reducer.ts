import { createReducer, on } from '@ngrx/store';
import * as SchemeRegistrationActionTypes from './scheme-registration.actions';
import { SchemeRegistration } from '../models/scheme-registration.model';
import { SearchAddressCriteria } from '@shared/models';
import * as SharedActions from '@shared/store/shared.action';

export const registrationConfirmationFeatureKey = 'scheme-registration';

export type SchemeRegistrationStoreType = SchemeRegistration & {
  searchAddress: SearchAddressCriteria;
  manuallyInsertedSiteAddress: boolean | null;
};

export const initialState: SchemeRegistrationStoreType = {
  id: null,
  name: null,
  reference: null,
  status: null,
  company: null,
  responsiblePerson: {
    id: null,
    firstName: null,
    lastName: null,
    email: null,
    jobTitle: null,
    address1: null,
    address2: null,
    town: null,
    county: null,
    postcode: null,
    telephone1: null,
    telephone2: null,
    organisation: {
      id: null,
      name: null,
      registrationNumber: null,
      address1: null,
      address2: null,
      postcode: null,
      town: null,
      county: null,
    }
  },
  site: {
    areYouTheSiteContactPerson: true,
    id: null,
    name: null,
    address1: null,
    address2: null,
    postcode: null,
    town: null,
    county: null,
    instructions: null,
    contactPerson: null
  },
  searchAddress: {
    postcode: null,
    nameOrBuildingNumber: null,
  },
  manuallyInsertedSiteAddress: null,
  sicCode: null,
  econSector: null,
  econSubSector: null,
  latestSubmissionStatus: null
};

export const reducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(SchemeRegistrationActionTypes.resetScheme, state => ({
    ...initialState,
  })),
  on(
    SchemeRegistrationActionTypes.setSchemeOrganisation,
    (state, action) => ({
      ...state,
      company: action.organisation,
  })),
  on(
    SchemeRegistrationActionTypes.setSicCode,
    (state, { sicCode }) => ({
      ...state,
      sicCode
  })),
  on(
    SchemeRegistrationActionTypes.setEconomicSector,
    (state, { econSector }) => ({
      ...state,
      econSector
  })),
  on(
    SchemeRegistrationActionTypes.setEconomicSubSector,
    (state, { econSubSector }) => ({
      ...state,
      econSubSector
  })),
  on(SchemeRegistrationActionTypes.setSchemeName, (state, action) => ({
    ...state,
    name: action.name,
  })),
  on(
    SchemeRegistrationActionTypes.setSearchSiteAddressCriteria,
    (state, action) => ({
      ...state,
      searchAddress: {
        ...action.criteriaToSearch
      },
    })
  ),
  on(SchemeRegistrationActionTypes.setResponsiblePerson, (state, action) => ({
    ...state,
    responsiblePerson: {
      ...action.responsiblePerson
    }
  })),
  on(SchemeRegistrationActionTypes.setSite, (state, action) => ({
    ...state,
    site: {
      ...action.site,
      name: action.site.address1
    },
    manuallyInsertedSiteAddress: action.manuallyInsertedSiteAddress
  })),
  on(SchemeRegistrationActionTypes.setSiteContactDetails, (state, action) => ({
    ...state,
    site: {
      ...state.site,
      areYouTheSiteContactPerson: action.areYouTheSiteContactPerson,
    },
  })),
  on(
    SchemeRegistrationActionTypes.setNewSiteContact,
    (state, { contactPerson }) => ({
      ...state,
      site: { ...state.site, contactPerson },
    })
  ),
  on(
    SchemeRegistrationActionTypes.loadExisitingSiteContactSuccess,
    (state, { id, contactPerson }) => ({
      ...state,
      site: {
        ...state.site,
        id: id,
        contactPerson
      },
    })
  )
);