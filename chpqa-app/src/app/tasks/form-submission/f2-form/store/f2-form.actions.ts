import { createAction, props } from '@ngrx/store';
import { Documentation } from '../models/documentation.model';

export enum F2FormActionTypes {
  NAVIGATE_TO = '[F2 Form] Navigate to',
  SET_SCHEME_LINE_DIAGRAM = '[F2 Form] Set Scheme Line Diagram',
  SUBMIT_SCHEME_LINE_DIAGRAM = '[F2 Form] Submit Scheme Line Diagram',
  SET_ENERGY_FLOW = '[F2 Form] Set Energy Flow',
  SUBMIT_ENERGY_FLOW = '[F2 Form] Submit Energy Flow',
  SET_DAILY_HEAT_PROFILE = '[F2 Form] Set Daily heat profile Flow',
  SUBMIT_DAILY_HEAT_PROFILE = '[F2 Form] Submit Daily heat profile Flow',
  SET_ANNUAL_HEAT_PROFILE = '[F2 Form] Set Annual heat profile Flow',
  SUBMIT_ANNUAL_HEAT_PROFILE = '[F2 Form] Submit Annual heat profile Flow',
  SET_HEAT_LOAD_DURATION_CURVE = '[F2 Form] Set Heat Load Duration Curve',
  SUBMIT_HEAT_LOAD_DURATION_CURVE = '[F2 Form] Submit Heat Load Duration Curve',
  SET_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS = '[F2 Form] Set total power capacity under MaxHeat condition',
  SUBMIT_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS = '[F2 Form] Submit total power capacity under MaxHeat condition',
  SUBMIT_SCHEME_DETAILS = '[F2 Form] Submit Scheme Details',

}

export const navigateTo = createAction(
  F2FormActionTypes.NAVIGATE_TO,
  props<{ url: string }>()
);

export const setSchemeLineDiagram = createAction(
  F2FormActionTypes.SET_SCHEME_LINE_DIAGRAM,
  props<{ schemeLineDiagram: Documentation }>()
);
export const submitSchemeLineDiagram = createAction(
  F2FormActionTypes.SUBMIT_SCHEME_LINE_DIAGRAM
);

export const setEnergyFlow = createAction(
  F2FormActionTypes.SET_ENERGY_FLOW,
  props<{ energyFlow: Documentation }>()
);

export const submitEnergyFlow = createAction(
  F2FormActionTypes.SUBMIT_ENERGY_FLOW
);

export const setDailyHeatProfile = createAction(
  F2FormActionTypes.SET_DAILY_HEAT_PROFILE,
  props<{ dailyHeatProfile: Documentation }>()
);

export const submitDailyHeatProfile = createAction(
  F2FormActionTypes.SUBMIT_DAILY_HEAT_PROFILE
);

export const setAnnualHeatProfile = createAction(
  F2FormActionTypes.SET_ANNUAL_HEAT_PROFILE,
  props<{ annualHeatProfile: Documentation }>()
);

export const submitAnnualHeatProfile = createAction(
  F2FormActionTypes.SUBMIT_ANNUAL_HEAT_PROFILE
);

export const setHeatLoadDurationCurve= createAction(
  F2FormActionTypes.SET_HEAT_LOAD_DURATION_CURVE,
  props<{ heatLoadDurationCurve: Documentation }>()
);

export const submitHeatLoadDurationCurve = createAction(
  F2FormActionTypes.SUBMIT_HEAT_LOAD_DURATION_CURVE
);

export const setTotalPowerCapacityUnderMaxHeat= createAction(
  F2FormActionTypes.SET_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS,
  props<{ totalPowerCapacityUnderMaxHeat: number }>()
);

export const submitTotalPowerCapacityUnderMaxHeat= createAction(
  F2FormActionTypes.SUBMIT_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS
);

export const submitSchemeDetails = createAction(
  F2FormActionTypes.SUBMIT_SCHEME_DETAILS,
);
