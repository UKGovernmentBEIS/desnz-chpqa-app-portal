import { createReducer, on } from '@ngrx/store';
import * as PrimeMoverActions from './prime-mover.actions';
import { PrimeMover } from '@shared/models/form-submission.model';
import * as SharedActions from '@shared/store/shared.action';

export const primeMoverFeatureKey = 'primeMover';

export const initialState: PrimeMover = {
  id: null,
  tagNumber: null,
  yearCommissioned: { id: '', name: '' },
  engineType: { id: '', name: '' },
  engineSubtype: { id: '', name: '' },
  mechanicalLoad: null,
  manufacturer: { id: '', name: '' },
  manufacturerOther: '',
  model: { id: '', name: '' },
  modelOther: '',
  engineName: { id: '', name: '' },
  engineUnitOther: '',
  totalHeatOutputKw: 0,
  totalPowerCapacityKw: 0,
  powerEfficiency: 0,
  maxHeatToPowerRatio: 0,
  maxHeatEfficiency: 0,
  maxOverallEfficiency: 0,
  fuelInputKw: 0,
  files: [],
  comments: '',
  customUnit: false,
  state: null,
  index: null,
  deletedFileIds: [],
  name: '',
};

export const registrationConfirmationFeatureKey = 'scheme-details';

export const reducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState,
  })),
  on(PrimeMoverActions.setPrimeMoverDetails, (state, { tagNumber, yearCommissioned }) => ({
    ...state,
    tagNumber: tagNumber,
    yearCommissioned: yearCommissioned,
  })),
  on(PrimeMoverActions.setPrimeMoverType, (state, { engineType }) => ({
    ...state,
    engineType: engineType,
  })),
  on(PrimeMoverActions.setPrimeMoverSubtype, (state, { engineSubtype }) => ({
    ...state,
    engineSubtype: engineSubtype,
  })),
  on(PrimeMoverActions.setPrimeMoverMechanicalLoad, (state, { mechanicalLoad }) => ({
    ...state,
    mechanicalLoad: mechanicalLoad,
  })),
  on(PrimeMoverActions.setPrimeMoverEngineManufacturer, (state, { manufacturer }) => ({
    ...state,
    manufacturer: manufacturer,
  })),
  on(PrimeMoverActions.setPrimeMoverEngineModel, (state, { model }) => ({
    ...state,
    model: model,
  })),
  on(PrimeMoverActions.setPrimeMoverEngineName, (state, { engineName }) => ({
    ...state,
    engineName: engineName,
  })),
  on(PrimeMoverActions.setCustomManufacturer, (state, { manufacturerOther }) => ({
    ...state,
    manufacturerOther: manufacturerOther,
  })),
  on(PrimeMoverActions.setCustomModel, (state, { modelOther }) => ({
    ...state,
    modelOther: modelOther,
  })),
  on(PrimeMoverActions.setCustomEngine, (state, { engineUnitOther }) => ({
    ...state,
    engineUnitOther: engineUnitOther,
  })),
  on(PrimeMoverActions.setCustomUnitId, (state, { customUnitId }) => ({
    ...state,
    manufacturer: {
      id: customUnitId.manufacturer.id,
      name: customUnitId.manufacturer.name,
    },
    model: {
      id: customUnitId.model.id,
      name: customUnitId.model.name,
    },
    engineName: {
      id: customUnitId.engineUnit.id,
      name: customUnitId.engineUnit.name,
    }
  })),
  on(PrimeMoverActions.setNewCustomUnitStatus, (state, { customUnit }) => ({
    ...state,
    customUnit: customUnit,
  })),
  on(PrimeMoverActions.setPrimeMoverEngineMetrics, (state, { engine }) => ({
    ...state,
    totalPowerCapacityKw: engine.totalPowerCapacityKw,
    totalHeatOutputKw: engine.totalHeatOutputKw,
    powerEfficiency: engine.powerEfficiency,
    maxHeatToPowerRatio: engine.maxHeatToPowerRatio,
    maxHeatEfficiency: engine.maxHeatEfficiency,
    maxOverallEfficiency: engine.maxOverallEfficiency,
    fuelInputKw: engine.fuelInputKw,
  })),
  on(PrimeMoverActions.setPrimeMoverDocumentation, (state, { comments, files, deletedFileIds }) => ({
    ...state,
    comments: comments,
    files: files,
    deletedFileIds: deletedFileIds,
  })),
  on(PrimeMoverActions.updatePrimeMover, (state, { primeMover, index }) => ({
    ...state,
    ...primeMover,
    index: index,
  })),
  on(PrimeMoverActions.resetPrimeMoverState, () => initialState),
  on(PrimeMoverActions.setPrimeMoverState, (state, { arrayItemState, index }) => ({
    ...state,
    state: arrayItemState,
    index: index,
  })),
  on(PrimeMoverActions.deletePrimeMover, (state, { id, index, name }) => ({
    ...state,
    id: id,
    index: index,
    name: name,
  }))
);
