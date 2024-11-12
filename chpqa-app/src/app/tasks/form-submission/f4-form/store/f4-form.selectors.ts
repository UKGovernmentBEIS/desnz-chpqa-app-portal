import { createFeatureSelector, createSelector } from '@ngrx/store';
import { F4FormState } from './f4-form.reducer';

export const selectRequest = createFeatureSelector<F4FormState>('f4-form');

export const selectHoursOfOperation = createSelector(
  selectRequest,
  state => state?.hoursOfOperation
);

export const selectEnergyInput = createSelector(
  selectRequest,
  state => state?.energyInputData?.energyInput
);

export const selectEnergyInputIndex = createSelector(
  selectRequest,
  state => state?.energyInputData?.index
);

export const selectEnergyInputs = createSelector(
  selectRequest,
  state => state?.energyInputData.energyInputs
);

export const selectTotalEnergyInputs = createSelector(
  selectRequest,
  state => state?.energyInputData.totalEnergyInputs
);

export const selectEnergyInputsStatus = createSelector(
  selectRequest,
  state => state?.energyInputData.areEnergyInputsCompleted
);

export const selectHeatOutput = createSelector(
  selectRequest,
  state => state?.heatMonitoringData?.heatOutput
);

export const selectHeatOutputs = createSelector(
  selectRequest,
  state => state?.heatMonitoringData?.heatOutputs
);

export const selectTotalMetricsHeatOutputs = createSelector(
  selectRequest,
  state => ({
    totalHeatOutputs: state?.heatMonitoringData?.totalHeatOutputs,
    qualifyingHeatOutput: state?.heatMonitoringData?.qualifyingHeatOutput,
  })
);

export const selectHeatOutputsStatus = createSelector(
  selectRequest,
  state => state?.heatMonitoringData?.areHeatOutputsCompleted
);

export const selectPowerOutput = createSelector(
  selectRequest,
  state => state?.powerOutputData?.powerOutput
);

export const selectPowerOutputIndex = createSelector(
  selectRequest,
  state => state?.powerOutputData?.index
);

export const selectPowerOutputs = createSelector(
  selectRequest,
  state => state?.powerOutputData?.powerOutputs
);

export const selectTotalPowerOutputs = createSelector(
  selectRequest,
  state => state?.powerOutputData?.totalPowerOutputs
);

export const selectPowerOutputsStatus = createSelector(
  selectRequest,
  state => state?.powerOutputData.arePowerOutsCompleted
);

export const selectRequestSoSCertificate = createSelector(
  selectRequest,
  state => state?.requestSoSCertificate
);

export const selectRequestRocCertificate = createSelector(
  selectRequest,
  state => state?.requestRocCertificate
);

export const selectRequestCfdCertificate = createSelector(
  selectRequest,
  state => state?.requestCfdCertificate
);

export const selectAggreeToTerms = createSelector(
  selectRequest,
  state => state?.aggreeToTerms
);

export const selectQualityIndexThreshold = createSelector(
  selectRequest,
  state => state?.qualityIndexThreshold
);

export const selectCondensingSteamTurbine= createSelector(
  selectRequest,
  state => state?.condensingSteamTurbine
);