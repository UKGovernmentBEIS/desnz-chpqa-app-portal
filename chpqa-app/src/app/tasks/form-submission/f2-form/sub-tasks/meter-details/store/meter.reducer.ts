import { createReducer, on } from '@ngrx/store';
import * as MeterActions from './meter.actions';
import * as SharedActions from '@shared/store/shared.action';
import { Meter } from '@shared/models/form-submission.model';

export const initialState: Meter = {
  tagNumber: null,
  serialNumber: null,
  yearInstalled: { id: '', name: '' },
  meterType: { id: '', name: '' },
  existingOrProposed: null,
  fiscal: null,
  fiscalPoint: null,
  measureType: null,
  outputRangeMin: null,
  outputRangeMax: null,
  outputUnit: { id: '', name: '' },
  outputUnitOther: '',
  comments: '',
  uncertainty: null,
  files: [],
  state: null,
  index: null,
  deletedFileIds: [],
  name: '',
};

export const meterFeatureKey = 'meter';

export const reducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState,
  })),
  on(MeterActions.setMeterDetails, (state, { tagNumber, serialNumber, yearInstalled }) => ({
    ...state,
    tagNumber: tagNumber,
    serialNumber: serialNumber,
    yearInstalled: yearInstalled,
  })),
  on(MeterActions.setMeterType, (state, { meterType }) => ({
    ...state,
    meterType: meterType,
  })),
  on(MeterActions.setMeterExistingOrProposed, (state, { existingOrProposed }) => ({
    ...state,
    existingOrProposed: existingOrProposed,
  })),
  on(MeterActions.setMeterMeasurement, (state, { measureType }) => ({
    ...state,
    measureType: measureType,
  })),
  on(MeterActions.setMeterOutput, (state, { outputRangeMin, outputRangeMax, outputUnit }) => ({
    ...state,
    outputRangeMin: outputRangeMin,
    outputRangeMax: outputRangeMax,
    outputUnit: outputUnit,
  })),
  on(MeterActions.setMeterCustomOutputUnit, (state, { outputUnitOther }) => ({
    ...state,
    outputUnitOther: outputUnitOther,
  })),
  on(MeterActions.createOutputUnitSuccess, (state, { customOutputUnit }) => ({
    ...state,
    outputUnit: {
      id: customOutputUnit.id,
      name: customOutputUnit.name,
    },
  })),

  on(MeterActions.setMeterUncertainty, (state, { uncertainty }) => ({
    ...state,
    uncertainty: uncertainty,
  })),
  on(MeterActions.setMeterFiscal, (state, { fiscal, fiscalPoint }) => ({
    ...state,
    fiscal: fiscal,
    fiscalPoint: fiscalPoint,
  })),
  on(MeterActions.setMeterDocumentation, (state, { documentation }) => ({
    ...state,
    comments: documentation.comments,
    files: documentation.files,
    deletedFileIds: documentation.deletedFileIds,
  })),
  on(MeterActions.updateMeter, (state, { meter, index }) => ({
    ...state,
    ...meter,
    index: index,
  })),
  on(MeterActions.resetMeterState, () => initialState),
  on(MeterActions.setMeterState, (state, { arrayItemState, index }) => ({
    ...state,
    state: arrayItemState,
    index: index,
  })),
  on(MeterActions.deleteMeter, (state, { id, index, name }) => ({
    ...state,
    id: id,
    index: index,
    name: name,
  }))
);
