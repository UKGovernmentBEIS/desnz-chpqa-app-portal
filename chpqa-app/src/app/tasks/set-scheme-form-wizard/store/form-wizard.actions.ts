import { createAction, props } from '@ngrx/store';

export enum F2FormActionTypes {
  NAVIGATE_TO = '[Form Wizard] Navigate to',
  SET_IS_OPERATIONAL = '[Form Wizard] Set f2 operational',
  SET_MEETS_CRITERIA = '[Form Wizard] Set f2 criteria'
}

export const navigateTo = createAction(
  F2FormActionTypes.NAVIGATE_TO,
  props<{ url: string }>()
);

export const setIsOperational = createAction(
  F2FormActionTypes.SET_IS_OPERATIONAL,
  props<{ isOperational: boolean }>()
);

export const setMeetsCriteria = createAction(
  F2FormActionTypes.SET_MEETS_CRITERIA,
  props<{ meetsCriteria: boolean }>()
);