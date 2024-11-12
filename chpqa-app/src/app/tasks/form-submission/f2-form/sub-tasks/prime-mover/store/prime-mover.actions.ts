import { createAction, props } from '@ngrx/store';
import { OptionItem } from '@shared/models/option-item.model';
import { EngineUnitMetrics, PrimeMover } from '@shared/models/form-submission.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { FileWithId } from '@shared/models/file-with-id.model';
import { ArrayItemState } from '@shared/models/array-item-state';
import { RequestReturnManuModelEngineUnitId } from 'src/app/api-services/chpqa-api/generated';

export enum PrimeMoverActionTypes {
  NAVIGATE_TO = '[Prime Mover] Navigate to',
  SET_PRIME_MOVER_DETAILS = '[Prime Mover] Set Prime Mover Details',
  SET_PRIME_MOVER_TYPE = '[Prime Mover] Set Prime Mover Type',
  SET_PRIME_MOVER_SUBTYPE = '[Prime Mover] Set Prime Mover Subtype',
  SET_PRIME_MOVER_MECHANICAL_LOAD = '[Prime Mover] Set Prime Mover Mechanical Load',
  SET_PRIME_MOVER_ENGINE_MANUFACTURER = '[Prime Mover] Set Prime Mover Engine Manufacturer',
  SET_PRIME_MOVER_ENGINE_MODEL = '[Prime Mover] Set Prime Mover Engine Model',
  SET_PRIME_MOVER_ENGINE_NAME = '[Prime Mover] Set Prime Mover Engine Name',
  SET_PRIME_MOVER_ENGINE_METRICS = '[Prime Mover] Set Prime Mover Engine Metrics',
  SET_PRIME_MOVER_DOCUMENTATION = '[Prime Mover] Set Prime Mover Documentation',
  GET_ENGINE_UNIT_BY_ID = '[Prime Mover] Get Engine Unit By Id',
  GET_ENGINE_UNIT_BY_ID_FAIL = '[Prime Mover] Get Engine Unit By Id Fail',
  SET_CUSTOM_MANUFACTURER = '[Prime Mover] Set Custom Manufacturer',
  SET_CUSTOM_MODEL = '[Prime Mover] Set Custom Model',
  SET_CUSTOM_ENGINE = '[Prime Mover] Set Custom Engine',
  SET_NEW_CUSTOM_UNIT_STATUS = '[Prime Mover] Set New Custom Unit Status',
  SET_CUSTOM_UNIT_ID = '[Prime Mover] Set Custom Unit Id',
  SUBMIT_NEW_CUSTOM_UNIT = '[Prime Mover] Submit New Custom Unit',
  ADD_ANOTHER_PRIME_MOVER = '[Prime Mover] Add Another Prime Mover',
  UPDATE_PRIME_MOVER = '[Prime Mover] Update Prime Mover',
  SUBMIT_PRIME_MOVERS = '[Prime Mover] Submit Prime Movers',
  SUBMIT_PRIME_MOVERS_SUCCESS = '[Prime Mover] Submit Prime Movers Success',
  SUBMIT_PRIME_MOVERS_FAILURE = '[Prime Mover] Submit Prime Movers Failure',
  RESET_PRIME_MOVER_STATE = '[Prime Mover] Reset Prime Mover State',
  SET_PRIME_MOVER_STATE = '[Prime Mover] Set Prime Mover State',
  RESET_SUBMITTING_PRIME_MOVER_STATE = '[Prime Mover] Reset Submitting Prime Mover State',
  DOWNLOAD_PRIME_MOVER_FILE = '[Prime Mover] Download Prime Mover File',
  DELETE_PRIME_MOVER = '[Prime Mover] Delete Prime Mover',
  CONFIRM_DELETE_PRIME_MOVER = '[Prime Mover] Confirm Delete Prime Mover',
}

export const navigateTo = createAction(PrimeMoverActionTypes.NAVIGATE_TO, props<{ url: string }>());

export const setPrimeMoverDetails = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_DETAILS, props<{ tagNumber: string; yearCommissioned: OptionItem }>());

export const setPrimeMoverMechanicalLoad = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_MECHANICAL_LOAD, props<{ mechanicalLoad: RadioButtonOption }>());

export const setPrimeMoverType = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_TYPE, props<{ engineType: OptionItem }>());

export const setPrimeMoverSubtype = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_SUBTYPE, props<{ engineSubtype: OptionItem }>());

export const setPrimeMoverEngineManufacturer = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_ENGINE_MANUFACTURER, props<{ manufacturer: OptionItem }>());

export const setPrimeMoverEngineModel = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_ENGINE_MODEL, props<{ model: OptionItem }>());

export const setPrimeMoverEngineName = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_ENGINE_NAME, props<{ engineName: OptionItem }>());

export const setPrimeMoverEngineMetrics = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_ENGINE_METRICS, props<{ engine: EngineUnitMetrics }>());

export const getEngineUnitById = createAction(PrimeMoverActionTypes.GET_ENGINE_UNIT_BY_ID, props<{ id: string }>());

export const getEngineUnitByIdFail = createAction(PrimeMoverActionTypes.GET_ENGINE_UNIT_BY_ID_FAIL);

export const setCustomManufacturer = createAction(PrimeMoverActionTypes.SET_CUSTOM_MANUFACTURER, props<{ manufacturerOther: string }>());

export const setCustomModel = createAction(PrimeMoverActionTypes.SET_CUSTOM_MODEL, props<{ modelOther: string }>());

export const setCustomEngine = createAction(PrimeMoverActionTypes.SET_CUSTOM_ENGINE, props<{ engineUnitOther: string }>());

export const submitNewCustomInit = createAction(PrimeMoverActionTypes.SUBMIT_NEW_CUSTOM_UNIT, props<{ engine: EngineUnitMetrics }>());

export const setNewCustomUnitStatus = createAction(PrimeMoverActionTypes.SET_NEW_CUSTOM_UNIT_STATUS, props<{ customUnit: boolean }>());

export const setCustomUnitId = createAction(
  PrimeMoverActionTypes.SET_CUSTOM_UNIT_ID,
  props<{ customUnitId: RequestReturnManuModelEngineUnitId }>()
);

export const setPrimeMoverDocumentation = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_DOCUMENTATION, props<{ comments: string; files: FileWithId[], deletedFileIds: string[] }>());

export const addAnotherPrimeMover = createAction(PrimeMoverActionTypes.ADD_ANOTHER_PRIME_MOVER);

export const updatePrimeMover = createAction(PrimeMoverActionTypes.UPDATE_PRIME_MOVER, props<{ primeMover: PrimeMover, index: number }>());

export const submitPrimeMovers = createAction(PrimeMoverActionTypes.SUBMIT_PRIME_MOVERS);

export const submitPrimeMoversSuccess = createAction(PrimeMoverActionTypes.SUBMIT_PRIME_MOVERS_SUCCESS, props<{ successIds: {id: string, name: string}[] }>());

export const submitPrimeMoversFailure = createAction(PrimeMoverActionTypes.SUBMIT_PRIME_MOVERS_FAILURE, props<{ error: any }>());

export const resetPrimeMoverState = createAction(PrimeMoverActionTypes.RESET_PRIME_MOVER_STATE);

export const setPrimeMoverState = createAction(PrimeMoverActionTypes.SET_PRIME_MOVER_STATE, props<{ arrayItemState: ArrayItemState, index: number }>());

export const resetSubmittingPrimeMoverState = createAction(PrimeMoverActionTypes.RESET_SUBMITTING_PRIME_MOVER_STATE);

export const downloadPrimeMoverFile = createAction(PrimeMoverActionTypes.DOWNLOAD_PRIME_MOVER_FILE, props<{ id: string , fileName: string}>());

export const deletePrimeMover = createAction(PrimeMoverActionTypes.DELETE_PRIME_MOVER, props<{id: string, index: number, name: string }>());

export const confirmDeletePrimeMover = createAction(PrimeMoverActionTypes.CONFIRM_DELETE_PRIME_MOVER, props<{confirmDelete: RadioButtonOption}>());