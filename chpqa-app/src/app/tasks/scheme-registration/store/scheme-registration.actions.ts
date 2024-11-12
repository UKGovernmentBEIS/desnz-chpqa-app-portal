import { createAction, props } from '@ngrx/store';
import { PersonDetails, Site } from '../models/scheme-registration.model';
import { SearchAddressCriteria } from '@shared/models';
import { EconomicSector, EconomicSubSector, Organisation, SicCode } from 'src/app/api-services/chpqa-api/generated';

export enum SchemeRegistrationActionTypes {
  SET_SCHEME_ORGANISATION = '[Scheme Registration] Set scheme organisation',
  SET_SCHEME_NAME = '[Scheme Registration] Set scheme name',
  SET_SIC_CODE = '[Scheme Registration] Set sic code',
  SET_ECONOMIC_SECTOR = '[Scheme Registration] Set economic sector',
  SET_ECONOMIC_SUB_SECTOR = '[Scheme Registration] Set economic sub sector',
  SET_SEARCH_SITE_ADDRESS = '[Scheme Registration] Set search site address criteria',
  SET_SITE_CONTACT_DETAILS = '[Scheme Registration] Set site contact details',
  SET_RESPONSIBLE_PERSON = '[Scheme Registration] Set responsible perosn',
  SET_SITE = '[Scheme Registration] Set site',
  SET_MANUAL_SITE_ADDRESS = '[Scheme Registration] Set manual site address',
  SET_NEW_SITE_CONTACT = '[Scheme Registration] Set new site contact',
  RESET_SCHEME = '[Scheme Registration] Reset Scheme',
  SUBMIT_SCHEME = '[Scheme Registration] Submit Scheme',
  SUBMIT_SCHEME_SUCCESS = '[Scheme Registration] Submit Scheme Success',
  SUBMIT_SCHEME_FAILURE = '[Scheme Registration] Submit Scheme Failure',
  LOAD_EXISTING_SITE_CONTACT = '[Scheme Registration] Load Existing Site Contact',
  LOAD_EXISTING_SITE_CONTACT_SUCCESS = '[Scheme Registration] Load Existing Site Contact Success',
  LOAD_EXISTING_SITE_CONTACT_FAILURE = '[Scheme Registration] Load Existing Site Contact Failure',
}

export const setSchemeOrganisation = createAction(
  SchemeRegistrationActionTypes.SET_SCHEME_ORGANISATION,
  props<{ organisation: Organisation }>()
);

export const setSchemeName = createAction(
  SchemeRegistrationActionTypes.SET_SCHEME_NAME,
  props<{ name: string }>()
);

export const setSicCode = createAction(
  SchemeRegistrationActionTypes.SET_SIC_CODE,
  props<{ sicCode: SicCode }>()
);

export const setEconomicSector = createAction(
  SchemeRegistrationActionTypes.SET_ECONOMIC_SECTOR,
  props<{ econSector: EconomicSector }>()
);

export const setEconomicSubSector = createAction(
  SchemeRegistrationActionTypes.SET_ECONOMIC_SUB_SECTOR,
  props<{ econSubSector: EconomicSubSector }>()
);

export const setSearchSiteAddressCriteria = createAction(
  SchemeRegistrationActionTypes.SET_SEARCH_SITE_ADDRESS,
  props<{ criteriaToSearch: SearchAddressCriteria }>()
);

export const setResponsiblePerson = createAction(
  SchemeRegistrationActionTypes.SET_RESPONSIBLE_PERSON,
  props<{ responsiblePerson: PersonDetails }>()
);

export const setSite = createAction(
  SchemeRegistrationActionTypes.SET_SITE,
  props<{ site: Site, manuallyInsertedSiteAddress: boolean }>()
);

export const setSiteContactDetails = createAction(
  SchemeRegistrationActionTypes.SET_SITE_CONTACT_DETAILS,
  props<{ areYouTheSiteContactPerson: boolean }>()
);

export const setNewSiteContact = createAction(
  SchemeRegistrationActionTypes.SET_NEW_SITE_CONTACT,
  props<{ contactPerson: PersonDetails }>()
);

export const resetScheme = createAction(
  SchemeRegistrationActionTypes.RESET_SCHEME
);

export const submitScheme = createAction(
  SchemeRegistrationActionTypes.SUBMIT_SCHEME
);

export const submitSchemeSuccess = createAction(
  SchemeRegistrationActionTypes.SUBMIT_SCHEME_SUCCESS
);

export const submitSchemeFailure = createAction(
  SchemeRegistrationActionTypes.SUBMIT_SCHEME_FAILURE,  
  props<{ error: Error }>()
);

export const loadExisitingSiteContact = createAction(
  SchemeRegistrationActionTypes.LOAD_EXISTING_SITE_CONTACT
);

export const loadExisitingSiteContactSuccess = createAction(
  SchemeRegistrationActionTypes.LOAD_EXISTING_SITE_CONTACT_SUCCESS,
  props<{ id: string, contactPerson: PersonDetails }>()
);

export const loadExisitingSiteContactFailure = createAction(
  SchemeRegistrationActionTypes.LOAD_EXISTING_SITE_CONTACT_FAILURE,
  props<{ error: any }>()
);

