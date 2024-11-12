import { createAction, props } from '@ngrx/store';
import { OptionItem } from '@shared/models/option-item.model';
import { Documentation } from '../../../models/documentation.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { Meter } from '@shared/models/form-submission.model';
import { ArrayItemState } from '@shared/models/array-item-state';

export enum MeterActionTypes {
  NAVIGATE_TO = '[Meter Details] Navigate to',
  SET_METER_DETAILS = '[Meter Details] Set Meter Details',
  SET_METER_DOCUMENTATION = '[Meter Details] Set Meter Documentation',
  SET_METER_EXISTENCE = '[Meter Details] Set Meter Existence',
  SET_METER_OUTPUT = '[Meter Details] Set Meter Output',
  SET_METER_CUSTOM_OUTPUT_UNIT = '[Meter Details] Set Meter Custom Output Unit',
  SET_METER_UNCERTAINTY = '[Meter Details] Set Meter Uncertainty',
  SET_METER_FISCAL_CHECK = '[Meter Details] Set Meter Fiscal Check',
  SET_METER_REVIEW_ANSWERS = '[Meter Details] Set Meter Review Answers',
  SET_METER_TYPE = '[Meter Details] Set Meter Type',
  SET_METER_MEASUREMENT = '[Meter Details] Set Meter Measurement',
  ADD_ANOTHER_METER = '[Meter Details] Add Another Meter',
  UPDATE_METER = '[Meter Details] Update Meter',
  SUBMIT_METERS = '[Meter Details] Submit Meters',
  SUBMIT_METERS_SUCCESS = '[Meter Details] Submit Meters Success',
  SUBMIT_METERS_FAILURE = '[Meter Details] Submit Meters Failure',
  RESET_METER_STATE = '[Meter Details] Reset Meter State',
  SET_METER_STATE = '[Meter Details] Set Meter State',
  RESET_SUBMITTING_METER_STATE = '[Meter Details] Reset Submitting Meter State',
  CREATE_OUTPUT_UNIT = '[Meter Details] Create Output Unit',
  CREATE_OUTPUT_UNIT_SUCCESS = '[Meter Details] Create Output Unit Success',
  CREATE_OUTPUT_UNIT_FAILURE = '[Meter Details] Create Output Unit Failure',
  DOWNLOAD_METER_FILE = '[Meter Details] Download Meter File',
  DELETE_METER = '[Meter Details] Delete Meter',
  CONFIRM_DELETE_METER = '[Meter Details] Confirm Delete Meter',
}

export const navigateTo = createAction(MeterActionTypes.NAVIGATE_TO, props<{ url: string }>());

export const setMeterDetails = createAction(
  MeterActionTypes.SET_METER_DETAILS,
  props<{
    tagNumber: string;
    serialNumber: string;
    yearInstalled: OptionItem;
  }>()
);

export const setMeterType = createAction(MeterActionTypes.SET_METER_TYPE, props<{ meterType: OptionItem }>());

export const setMeterExistingOrProposed = createAction(MeterActionTypes.SET_METER_EXISTENCE, props<{ existingOrProposed: RadioButtonOption }>());

export const setMeterMeasurement = createAction(MeterActionTypes.SET_METER_MEASUREMENT, props<{ measureType: RadioButtonOption }>());

export const setMeterOutput = createAction(
  MeterActionTypes.SET_METER_OUTPUT,
  props<{
    outputRangeMin: number;
    outputRangeMax: number;
    outputUnit: OptionItem;
  }>()
);

export const setMeterCustomOutputUnit = createAction(
  MeterActionTypes.SET_METER_CUSTOM_OUTPUT_UNIT,
  props<{
    outputUnitOther: string;
  }>()
);

export const setMeterFiscal = createAction(MeterActionTypes.SET_METER_FISCAL_CHECK, props<{ fiscal: boolean; fiscalPoint: number }>());

export const setMeterUncertainty = createAction(MeterActionTypes.SET_METER_UNCERTAINTY, props<{ uncertainty: number }>());

export const setMeterDocumentation = createAction(MeterActionTypes.SET_METER_DOCUMENTATION, props<{ documentation: Documentation }>());

export const addAnotherMeter = createAction(MeterActionTypes.ADD_ANOTHER_METER);

export const updateMeter = createAction(MeterActionTypes.UPDATE_METER, props<{ meter: Meter, index: number}>());

export const submitMeters = createAction(MeterActionTypes.SUBMIT_METERS);

export const submitMetersSuccess = createAction(MeterActionTypes.SUBMIT_METERS_SUCCESS, props<{ successIds: {id: string, name: string}[] }>());

export const submitMetersFailure = createAction(MeterActionTypes.SUBMIT_METERS_FAILURE);

export const resetMeterState = createAction(MeterActionTypes.RESET_METER_STATE);

export const setMeterState = createAction(MeterActionTypes.SET_METER_STATE, props<{ arrayItemState: ArrayItemState, index: number }>());

export const resetSubmittingMetersState = createAction(MeterActionTypes.RESET_SUBMITTING_METER_STATE);

export const createOutputUnit = createAction(MeterActionTypes.CREATE_OUTPUT_UNIT);

export const createOutputUnitSuccess = createAction(MeterActionTypes.CREATE_OUTPUT_UNIT_SUCCESS, props<{ customOutputUnit: { id: string; name: string } }>());

export const createOutputUnitFailure = createAction(MeterActionTypes.CREATE_OUTPUT_UNIT_FAILURE, props<{ error: any }>());

export const downloadMeterFile = createAction(MeterActionTypes.DOWNLOAD_METER_FILE, props<{ id: string , fileName: string}>());

export const deleteMeter = createAction(MeterActionTypes.DELETE_METER, props<{id: string, index: number, name: string }>());

export const confirmDeleteMeter = createAction(MeterActionTypes.CONFIRM_DELETE_METER, props<{confirmDelete: RadioButtonOption}>());