import { createFeature, createReducer, on } from '@ngrx/store';
import * as SchemeDetailsActions from './f2-form.actions';
import * as SharedActions from '@shared/store/shared.action';
import { Documentation } from '../models/documentation.model';

export interface F2FormState {
  energyFlow: Documentation;
  dailyHeatProfile: Documentation;
  annualHeatProfile: Documentation;
  heatLoadDurationCurve: Documentation;
  schemeLineDiagram: Documentation;
  totalPowerCapacityUnderMaxHeat: number;
}

export const initialState: F2FormState = {
  energyFlow: {
    files: [],
    comments: '',
    deletedFileIds: [],
  },
  dailyHeatProfile: {
    files: [],
    comments: '',
    deletedFileIds: [],
  },
  annualHeatProfile: {
    files: [],
    comments: '',
    deletedFileIds: [],
  },
  heatLoadDurationCurve: {
    files: [],
    comments: '',
    deletedFileIds: [],
  },
  schemeLineDiagram: {
    files: [],
    comments: '',
    deletedFileIds: [],
  },
  totalPowerCapacityUnderMaxHeat: null,
};

export const reducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(SchemeDetailsActions.setEnergyFlow, (state, { energyFlow }) => ({
    ...state,
    energyFlow: energyFlow,
  })),
  on(
    SchemeDetailsActions.setDailyHeatProfile,
    (state, { dailyHeatProfile }) => ({
      ...state,
      dailyHeatProfile: dailyHeatProfile,
    })
  ),
  on(
    SchemeDetailsActions.setAnnualHeatProfile,
    (state, { annualHeatProfile }) => ({
      ...state,
      annualHeatProfile: annualHeatProfile,
    })
  ),
  on(
    SchemeDetailsActions.setHeatLoadDurationCurve,
    (state, { heatLoadDurationCurve }) => ({
      ...state,
      heatLoadDurationCurve: heatLoadDurationCurve,
    })
  ),
  on(
    SchemeDetailsActions.setSchemeLineDiagram,
    (state, { schemeLineDiagram }) => ({
      ...state,
      schemeLineDiagram: schemeLineDiagram,
    })
  ),
  on(
    SchemeDetailsActions.setTotalPowerCapacityUnderMaxHeat,
    (state, { totalPowerCapacityUnderMaxHeat }) => ({
      ...state,
      totalPowerCapacityUnderMaxHeat,
    })
  )
);

export const f2FormFeature = createFeature({
  name: 'f2FormFeature',
  reducer,
});
