import { createAction, props } from '@ngrx/store';
import {
  CondensingSteamTurbine,
  EnergyInput,
  HeatMonitoring,
  HoursOfOperationDataModel,
  PowerOutput,
} from '../models/f4-form.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';

export enum F4FormActionTypes {
  SET_HOURS_OF_OPERATION = '[F4 Form] Set Hours of operation',
  SUBMIT_HOURS_OF_OPERATION = '[F4 Form] Submit Hours of operation',
  SET_ENERGY_INPUT = '[F4 Form] Set Energy Input',
  SET_ENERGY_INPUTS = '[F4 Form] Set Energy Inputs',
  UPDATE_ENERGY_INPUTS = '[F4 Form] Update Energy Inputs',
  CALCULATE_ENERGY_INPUTS_TOTALS = '[F4 Form] Calculate Energy Inputs Totals',
  CALCULATE_ENERGY_INPUTS_TFIS = '[F4 Form] Calculate Energy Inputs TFIs',
  SUBMIT_ENERGY_INPUTS = '[F4 Form] Submit Energy Inputs',
  SUBMIT_ENERGY_INPUTS_SUCCESS = '[F4 Form] Submit Energy Inputs Success',
  SUBMIT_ENERGY_INPUTS_FAIL = '[F4 Form] Submit Energy Inputs Fail',
  RESET_ENERGY_INPUTS = '[F4 Form] Reset Energy Inputs',
  SET_POWER_OUTPUT = '[F4 Form] Set Power Output',
  SET_POWER_OUTPUTS = '[F4 Form] Set Power Outputs',
  UPDATE_POWER_OUTPUTS = '[F4 Form] Update Power Outputs',
  SUBMIT_POWER_OUTPUTS = '[F4 Form] Submit Power Outputs',
  SUBMIT_POWER_OUTPUTS_SUCCESS = '[F4 Form] Submit Power Outputs Success',
  SUBMIT_POWER_OUTPUTS_FAIL = '[F4 Form] Submit Power Outputs Fail',
  RESET_POWER_OUTPUTS = '[F4 Form] Reset Power Outputs',
  CALCULATE_POWER_OUTPUTS_TOTALS = '[F4 Form] Calculate Power Outputs Totals',
  SET_HEAT_REJECTION_FACILITY = '[F4 Form] Set Heat rejection facility',
  SET_HEAT_OUTPUT = '[F4 Form] Set Heat Output',
  SET_HEAT_OUTPUTS = '[F4 Form] Set Heat Outputs',
  FETCH_HEAT_OUTPUTS_FAIL = '[F4 Form] Set Heat Outputs Fail',
  UPDATE_HEAT_OUTPUTS = '[F4 Form] Update Heat Outputs',
  CALCULATE_HEAT_OUTPUTS_TOTALS = '[F4 Form] Calculate Heat Outputs Totals',
  SUBMIT_HEAT_OUTPUTS = '[F4 Form] Submit Heat Outputs',
  SUBMIT_REJECTION_HEAT_OUTPUTS = '[F4 Form] Submit  Rejection Heat Outputs',
  SUBMIT_HEAT_OUTPUTS_SUCCESS = '[F4 Form] Submit Heat Outputs Success',
  SET_CONDENSING_STEAM_TURBINE = '[F4 Form] Set Condensing Steam Turbine',
  SUBMIT_CONDENSING_STEAM_TURBINE = '[F4 Form] Submit Condensing Steam Turbine',
  SUBMIT_CONDENSING_STEAM_TURBINE_SUCCESS = '[F4 Form] Submit Condensing Steam Turbine Success',
  SUBMIT_CONDENSING_STEAM_TURBINE_FAILURE = '[F4 Form] Submit Condensing Steam Turbine failure',
  SET_REQUEST_SOS_CERTIFICATE = '[F4 Form] Set request for Secretary of State Exemption Certificate',
  SUBMIT_REQUEST_SOS_CERTIFICATE = '[F4 Form] Submit request for Secretary of State Exemption Certificate',
  SUBMIT_REQUEST_SOS_CERTIFICATE_SUCCESS = '[F4 Form] Submit request Secretary of State Exemption Certificate success',
  SUBMIT_REQUEST_SOS_CERTIFICATE_FAILURE = '[F4 Form] Submit request Secretary of State Exemption Certificate failure',
  SET_REQUEST_ROC_CERTIFICATE = '[F4 Form] Set request for Renewables Obligation Certificate',
  SUBMIT_REQUEST_ROC_CERTIFICATE = '[F4 Form] Submit request for Renewables Obligation Certificate',
  SUBMIT_REQUEST_ROC_CERTIFICATE_SUCCESS = '[F4 Form] Submit request Renewables Obligation Certificate success',
  SUBMIT_REQUEST_ROC_CERTIFICATE_FAILURE = '[F4 Form] Submit request Renewables Obligation Certificate failure',
  SET_REQUEST_CFD_CERTIFICATE = '[F4 Form] Set request for Contracts for Difference Certificate',
  SUBMIT_REQUEST_CFD_CERTIFICATE = '[F4 Form] Submit request for Contracts for Difference Certificate',
  SUBMIT_REQUEST_CFD_CERTIFICATE_SUCCESS = '[F4 Form] Submit request Contracts for Difference Certificate success',
  SUBMIT_REQUEST_CFD_CERTIFICATE_FAILURE = '[F4 Form] Submit request Contracts for Difference Certificate failure',
  SET_QUALITY_INDEX_THRESHOLD = '[F4 Form] Set Quality Index Threshold',
  SUBMIT_QUALITY_INDEX_THRESHOLD = '[F4 Form] Submit Quality Index Threshold',
  SUBMIT_QUALITY_INDEX_THRESHOLD_SUCCESS = '[F4 Form] Submit Quality Index Threshold Success',
  SUBMIT_QUALITY_INDEX_THRESHOLD_FAIL = '[F4 Form] Submit Quality Index Threshold Fail',
  SET_AGGREE_TO_TERMS = '[F4 Form] Set aggree to terms',
  SUBMIT_TO_ASSESSOR = '[F4 Form] Submit to Assessor',
  SUBMIT_TO_ASSESSOR_SUCCESS = '[F4 Form] Submit to Assessor success',
  SUBMIT_TO_ASSESSOR_FAILURE = '[F4 Form] Submit to Assessor failure',
}

export const setHoursOfOperation = createAction(
  F4FormActionTypes.SET_HOURS_OF_OPERATION,
  props<{ payload: HoursOfOperationDataModel }>()
);

export const submitHoursOfOperation = createAction(
  F4FormActionTypes.SUBMIT_HOURS_OF_OPERATION
);

export const setEnergyInput = createAction(
  F4FormActionTypes.SET_ENERGY_INPUT,
  props<{ index: number; energyInput: EnergyInput }>()
);

export const setEnergyInputs = createAction(
  F4FormActionTypes.SET_ENERGY_INPUTS,
  props<{ energyInputs: EnergyInput[] }>()
);

export const calculateEnergyInputsTFIs = createAction(
  F4FormActionTypes.CALCULATE_ENERGY_INPUTS_TFIS
);

export const updateEnergyInputs = createAction(
  F4FormActionTypes.UPDATE_ENERGY_INPUTS,
  props<{ index: number; energyInput: EnergyInput }>()
);

export const calculateEnergyInputTotals = createAction(
  F4FormActionTypes.CALCULATE_ENERGY_INPUTS_TOTALS
);

export const submitEnergyInputs = createAction(
  F4FormActionTypes.SUBMIT_ENERGY_INPUTS
);

export const submitEnergyInputsSuccess = createAction(
  F4FormActionTypes.SUBMIT_ENERGY_INPUTS_SUCCESS
);

export const submitEnergyInputsFail = createAction(
  F4FormActionTypes.SUBMIT_ENERGY_INPUTS_FAIL,
  props<{ error: any }>()
);

export const resetEnergyInputs = createAction(
  F4FormActionTypes.RESET_ENERGY_INPUTS
);

export const setPowerOutput = createAction(
  F4FormActionTypes.SET_POWER_OUTPUT,
  props<{ index: number; powerOutput: PowerOutput }>()
);

export const setPowerOutputs = createAction(
  F4FormActionTypes.SET_POWER_OUTPUTS,
  props<{ powerOutputs: PowerOutput[] }>()
);

export const updatePowerOutputs = createAction(
  F4FormActionTypes.UPDATE_POWER_OUTPUTS,
  props<{ index: number; powerOutput: PowerOutput }>()
);

export const calculatePowerOutputsTotals = createAction(
  F4FormActionTypes.CALCULATE_POWER_OUTPUTS_TOTALS
);

export const submitPowerOutputs = createAction(
  F4FormActionTypes.SUBMIT_POWER_OUTPUTS
);

export const submitPowerOutputsSuccess = createAction(
  F4FormActionTypes.SUBMIT_POWER_OUTPUTS_SUCCESS
);

export const submitPowerOutputsFail = createAction(
  F4FormActionTypes.SUBMIT_POWER_OUTPUTS_FAIL,
  props<{ error: any }>()
);

export const resetPowerOutputs = createAction(
  F4FormActionTypes.RESET_POWER_OUTPUTS
);

export const setHeatOutput = createAction(
  F4FormActionTypes.SET_HEAT_OUTPUT,
  props<{ index: number; heatOutput: HeatMonitoring }>()
);

export const fetchHeatOutputsFail = createAction(
  F4FormActionTypes.FETCH_HEAT_OUTPUTS_FAIL,
  props<{ error: any }>()
);

export const setHeatOutputs = createAction(
  F4FormActionTypes.SET_HEAT_OUTPUTS,
  props<{ heatOutputs: HeatMonitoring[] }>()
);

export const updateHeatOutputs = createAction(
  F4FormActionTypes.UPDATE_HEAT_OUTPUTS,
  props<{ payload: { index: number; heatOutput: HeatMonitoring } }>()
);

export const calculateHeatOutputsTotals = createAction(
  F4FormActionTypes.CALCULATE_HEAT_OUTPUTS_TOTALS
);

export const submitHeatOutputs = createAction(
  F4FormActionTypes.SUBMIT_HEAT_OUTPUTS
);

export const submitHeatOutputsSuccess = createAction(
  F4FormActionTypes.SUBMIT_HEAT_OUTPUTS_SUCCESS
);

export const submitRejectionHeatOutputs = createAction(
  F4FormActionTypes.SUBMIT_REJECTION_HEAT_OUTPUTS
);

export const setCondensingSteamTurbine = createAction(
  F4FormActionTypes.SET_CONDENSING_STEAM_TURBINE,
  props<{ condensingSteamTurbine: CondensingSteamTurbine }>()
);

export const submitCondensingSteamTurbine = createAction(
  F4FormActionTypes.SUBMIT_CONDENSING_STEAM_TURBINE
);

export const submitCondensingSteamTurbineSuccess = createAction(
  F4FormActionTypes.SUBMIT_CONDENSING_STEAM_TURBINE_SUCCESS
);

export const submitCondensingSteamTurbineFailure = createAction(
  F4FormActionTypes.SUBMIT_CONDENSING_STEAM_TURBINE_FAILURE,
  props<{ error: any }>()
);

export const setRequestSoSCertificate = createAction(
  F4FormActionTypes.SET_REQUEST_SOS_CERTIFICATE,
  props<{ requestSoSCertificate: boolean }>()
);

export const submitRequestSoSCertificate = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_SOS_CERTIFICATE
);

export const submitRequestSoSCertificateSuccess = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_SOS_CERTIFICATE_SUCCESS
);

export const submitRequestSoSCertificateFailure = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_SOS_CERTIFICATE_FAILURE
);

export const setRequestRocCertificate = createAction(
  F4FormActionTypes.SET_REQUEST_ROC_CERTIFICATE,
  props<{ requestRocCertificate: boolean }>()
);

export const submitRequestRocCertificate = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_ROC_CERTIFICATE
);

export const submitRequestRocCertificateSuccess = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_ROC_CERTIFICATE_SUCCESS
);

export const submitRequestRocCertificateFailure = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_ROC_CERTIFICATE_FAILURE
);

export const setRequestCfdCertificate = createAction(
  F4FormActionTypes.SET_REQUEST_CFD_CERTIFICATE,
  props<{ requestCfdCertificate: boolean }>()
);

export const submitRequestCfdCertificate = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_CFD_CERTIFICATE
);

export const submitRequestCfdCertificateSuccess = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_CFD_CERTIFICATE_SUCCESS
);

export const submitRequestCfdCertificateFailure = createAction(
  F4FormActionTypes.SUBMIT_REQUEST_CFD_CERTIFICATE_FAILURE
);

export const setQualityIndexThreshold = createAction(
  F4FormActionTypes.SET_QUALITY_INDEX_THRESHOLD,
  props<{ qualityIndexThreshold: RadioButtonOption }>()
);

export const submitQualityIndexThreshold = createAction(
  F4FormActionTypes.SUBMIT_QUALITY_INDEX_THRESHOLD,
);

export const submitQualityIndexThresholdSuccess = createAction(
  F4FormActionTypes.SUBMIT_QUALITY_INDEX_THRESHOLD_SUCCESS,
);

export const submitQualityIndexThresholdFail = createAction(
  F4FormActionTypes.SUBMIT_QUALITY_INDEX_THRESHOLD_FAIL,
  props<{ error: any }>()
);

export const setAggreeToTerms = createAction(
  F4FormActionTypes.SET_AGGREE_TO_TERMS,
  props<{ aggreeToTerms: boolean }>()
);

export const submitToAssessor = createAction(
  F4FormActionTypes.SUBMIT_TO_ASSESSOR
);

export const submitToAssessorSuccess = createAction(
  F4FormActionTypes.SUBMIT_TO_ASSESSOR_SUCCESS
);

export const submitToAssessorFailure = createAction(
  F4FormActionTypes.SUBMIT_TO_ASSESSOR_FAILURE,
  props<{ error: any }>()
);
