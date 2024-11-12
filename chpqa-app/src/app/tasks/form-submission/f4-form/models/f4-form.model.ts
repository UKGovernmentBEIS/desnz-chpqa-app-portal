import { Months } from '@shared/enums/months.enum';
import { OptionItem } from '@shared/models/option-item.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';

export enum PowerType {
  Generated = 0,
  Exported = 1,
  Imported = 2,
}

export enum HeatType {
  SuppliedToSite = 0,
  Exported = 1,
}

export type MonthlyValues = {
  [key in Months]?: number;
};

export interface BasePerfomanceDetails {
  id: string;
  tag: string;
  tagNumber: string;
  tagPrefix: string;
  userTag: string;
  serialNumber: string;
  meter: OptionItem;
}

export interface PerfomanceDetails extends BasePerfomanceDetails {
  annualTotal: number;
  includeInCalculations: RadioButtonOption;
  months?: {[key in Months]: number};
}
export interface Fuel {
  id: string;
  name: string;
}

export interface FuelCategory {
  id: string;
  name: string;
  category: string;
  tooltip: string | null;
  rocs: boolean;
  renewable: boolean;
  fuelList: Fuel[];
}
export interface EnergyInput extends PerfomanceDetails {
  category: OptionItem;
  type: OptionItem;
  tfi?: number;
}

export interface EnergyInputData {
  energyInput: EnergyInput;
  index: number;
  energyInputs: EnergyInput[];
  totalEnergyInputs: number;
  areEnergyInputsCompleted: boolean;
}

export interface HoursOfOperationDataModel {
  hoursOfOperation: number;
  months: number;
}

export interface PowerOutputResponse extends BasePerfomanceDetails {
  diagramReferenceNumber: string;
  powerType: number;
  meter: OptionItem;
  meterType: OptionItem;
  annualTotal: number;
  includeInCalculations: boolean;
}
export interface PowerOutput extends PerfomanceDetails {
  type: OptionItem;
  diagramReferenceNumber: string;
  meter: OptionItem;
  category: OptionItem;
}

export interface PowerOutputData {
  powerOutput: PowerOutput;
  index: number;
  powerOutputs: PowerOutput[];
  totalPowerOutputs: {
    total: number;
    totalExportedPower: number;
    totalImportedPower: number;
  };
  arePowerOutsCompleted: boolean;
}

export interface HeatMonitoring extends PerfomanceDetails {
  type: OptionItem;
  meter: OptionItem;
  category: OptionItem;
}

export interface HeatMonitoringDataModel {
  heatOutput: HeatMonitoring;
  heatOutputs: HeatMonitoring[];
  totalHeatOutputs: number;
  qualifyingHeatOutput: number;
  areHeatOutputsCompleted: boolean;
}

export interface CondensingSteamTurbine {
  zRatioDetermined: RadioButtonOption;
  possibleToDetermineZRatio: string;
  steamExportPressure: number;
  steamTurbineSize: number;
  zRatio: number;
}

export interface SubmitHeatMonitoring {
  id: string;
  heatType: number;
  annualTotal: number;
  includeInCalculations: boolean;
}
