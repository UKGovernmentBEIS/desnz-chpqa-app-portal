import { createReducer, on } from '@ngrx/store';
import * as F4FormActions from './f4-form.actions';
import * as SharedActions from '@shared/store/shared.action';
import {
  HeatMonitoringDataModel,
  EnergyInputData,
  PowerOutputData,
  HoursOfOperationDataModel,
  CondensingSteamTurbine,
} from '../models/f4-form.model';
import {
  calculateHeatOutputTotals,
  calculatePowerOutputsTotals,
  calculateTfiEnergyInputs,
  calculateTotalEnergyInputs,
} from '../utils/f4-form.utils';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { setCondensingSteamTurbineFromFormSubmission } from '../../store';

export const F4FormFeatureKey = 'f4-form';

export interface F4FormState {
  hoursOfOperation: HoursOfOperationDataModel;
  energyInputData: EnergyInputData;
  powerOutputData: PowerOutputData;
  heatMonitoringData: HeatMonitoringDataModel;
  requestSoSCertificate: boolean;
  requestRocCertificate: boolean;
  requestCfdCertificate: boolean;
  aggreeToTerms: boolean;
  qualityIndexThreshold: RadioButtonOption;
  condensingSteamTurbine: CondensingSteamTurbine;
}

export const initialState: F4FormState = {
  hoursOfOperation: null,
  energyInputData: {
    energyInput: null,
    index: null,
    energyInputs: [],
    totalEnergyInputs: 0,
    areEnergyInputsCompleted: false
  },
  powerOutputData: {
    powerOutput: null,
    index: null,
    powerOutputs: [],
    totalPowerOutputs: {
      total: 0,
      totalExportedPower: 0,
      totalImportedPower: 0,
    },
    arePowerOutsCompleted: false
  },
  heatMonitoringData: null,
  requestSoSCertificate: null,
  requestRocCertificate: null,
  requestCfdCertificate: null,
  aggreeToTerms: null,
  qualityIndexThreshold: null,
  condensingSteamTurbine: null
};

export const reducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(F4FormActions.setHoursOfOperation, (state, { payload }) => ({
    ...state,
    hoursOfOperation: {
      hoursOfOperation: payload.hoursOfOperation,
      months: payload?.months,
    },
  })),
  on(F4FormActions.setEnergyInput, (state, { index, energyInput }) => ({
    ...state,
    energyInputData: {
      ...state.energyInputData,
      index: index,
      energyInput: energyInput,
    },
  })),
  on(F4FormActions.resetEnergyInputs, state => ({
    ...state,
    energyInputData: {
      ...initialState.energyInputData,
    },
  })),
  on(F4FormActions.calculateEnergyInputTotals, state => {
    const totalEnergyInputs = calculateTotalEnergyInputs(
      state.energyInputData.energyInputs
    );
    return {
      ...state,
      energyInputData: {
        ...state.energyInputData,
        totalEnergyInputs: totalEnergyInputs,
      },
    };
  }),
  on(F4FormActions.calculateEnergyInputsTFIs, state => {
    const areEnergyInputsCompleted = state.energyInputData.energyInputs.every(energyInput => energyInput?.type?.id);
    const updatedEnergyInputs = state.energyInputData.energyInputs.map(
      energyInput => ({
        ...energyInput,
        tfi: calculateTfiEnergyInputs(
          energyInput.annualTotal,
          state.energyInputData.totalEnergyInputs,
          energyInput.includeInCalculations.value as boolean
        ),
      })
    );
    return {
      ...state,
      energyInputData: {
        ...state.energyInputData,
        energyInputs: updatedEnergyInputs,
        areEnergyInputsCompleted: areEnergyInputsCompleted
      },
    };
  }),
  on(F4FormActions.setEnergyInputs, (state, { energyInputs }) => {
    return {
      ...state,
      energyInputData: {
        ...state.energyInputData,
        energyInputs: energyInputs,
      },
    };
  }),
  on(F4FormActions.updateEnergyInputs, (state, { index, energyInput }) => {
    const updatedEnergyInputs = [...state.energyInputData.energyInputs];
    updatedEnergyInputs[index] = {
      ...updatedEnergyInputs[index],
      ...energyInput,
    };
    return {
      ...state,
      energyInputData: {
        ...state.energyInputData,
        energyInputs: updatedEnergyInputs,
      },
    };
  }),
  on(F4FormActions.setPowerOutput, (state, { index, powerOutput }) => ({
    ...state,
    powerOutputData: {
      ...state.powerOutputData,
      index: index,
      powerOutput: powerOutput,
    },
  })),
  on(F4FormActions.calculatePowerOutputsTotals, state => {
    const arePowerOutsCompleted = state.powerOutputData.powerOutputs.every(powerOutput => powerOutput?.type?.id);
    const totalPowerOutputs = calculatePowerOutputsTotals(
      state.powerOutputData.powerOutputs
    );
    return {
      ...state,
      powerOutputData: {
        ...state.powerOutputData,
        totalPowerOutputs: totalPowerOutputs,
        arePowerOutsCompleted: arePowerOutsCompleted
      },
    };
  }),
  on(F4FormActions.setPowerOutputs, (state, { powerOutputs }) => {
    return {
      ...state,
      powerOutputData: {
        ...state.powerOutputData,
        powerOutputs: powerOutputs,
      },
    };
  }),
  on(F4FormActions.updatePowerOutputs, (state, { index, powerOutput }) => {
    const updatedPowerOutputs = [...state.powerOutputData.powerOutputs];
    updatedPowerOutputs[index] = {
      ...updatedPowerOutputs[index],
      ...powerOutput,
    };
    return {
      ...state,
      powerOutputData: {
        ...state.powerOutputData,
        powerOutputs: updatedPowerOutputs,
      },
    };
  }),
  on(F4FormActions.resetPowerOutputs, state => ({
    ...state,
    heatMonitoringData: {
      ...initialState.heatMonitoringData,
    },
  })),
  on(F4FormActions.setHeatOutput, (state, { heatOutput }) => ({
    ...state,
    heatMonitoringData: {
      ...state.heatMonitoringData,
      heatOutput,
    },
  })),
  on(F4FormActions.setHeatOutputs, (state, { heatOutputs }) => {
    return {
      ...state,
      heatMonitoringData: {
        ...state.heatMonitoringData,
        heatOutputs,
      },
    };
  }),
  on(F4FormActions.fetchHeatOutputsFail, (state, { error }) => ({
    ...state,
    error: error.message || 'Failed to fetch heat outputs',
  })),
  on(F4FormActions.calculateHeatOutputsTotals, state => {
    const areHeatOutputsCompleted = state.heatMonitoringData.heatOutputs.every(heatOutput => heatOutput?.type?.id);
    const totalHeatOutputs = calculateHeatOutputTotals(
      state.heatMonitoringData.heatOutputs
    );
    return {
      ...state,
      heatMonitoringData: {
        ...state.heatMonitoringData,
        qualifyingHeatOutput: totalHeatOutputs.qualifyingHeatOutput,
        totalHeatOutputs: totalHeatOutputs.totalHeatOutputs,
        areHeatOutputsCompleted: areHeatOutputsCompleted
      },
    };
  }),
  on(F4FormActions.updateHeatOutputs, (state, action) => {
    const updatedHeatOutput = {
      ...state.heatMonitoringData.heatOutputs[action.payload.index],
      ...action.payload.heatOutput,
    };
    const updatedHeatOutputs = [...state.heatMonitoringData.heatOutputs];
    updatedHeatOutputs[action.payload.index] = updatedHeatOutput;

    return {
      ...state,
      heatMonitoringData: {
        ...state.heatMonitoringData,
        heatOutputs: updatedHeatOutputs,
      },
    };
  }),
  on(
    F4FormActions.setCondensingSteamTurbine,
    (state, { condensingSteamTurbine }) => ({
      ...state,
      condensingSteamTurbine: condensingSteamTurbine,
    })
  ),
  on(
    F4FormActions.setRequestSoSCertificate,
    (state, { requestSoSCertificate }) => ({
      ...state,
      requestSoSCertificate: requestSoSCertificate,
    })
  ),
  on(
    F4FormActions.setRequestRocCertificate,
    (state, { requestRocCertificate }) => ({
      ...state,
      requestRocCertificate,
    })
  ),
  on(
    F4FormActions.setRequestCfdCertificate,
    (state, { requestCfdCertificate }) => ({
      ...state,
      requestCfdCertificate,
    })
  ),
  on(F4FormActions.setAggreeToTerms, (state, { aggreeToTerms }) => ({
    ...state,
    aggreeToTerms,
  })),
  on(F4FormActions.setQualityIndexThreshold, (state, { qualityIndexThreshold }) => ({
    ...state,
    qualityIndexThreshold,
  })),
  on(
   setCondensingSteamTurbineFromFormSubmission,
    (state, { condensingSteamTurbine }) => ({
      ...state,
      condensingSteamTurbine
    })
  ),
);
