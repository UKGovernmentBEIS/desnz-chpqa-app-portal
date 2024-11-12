import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { OptionItem } from './option-item.model';
import { RadioButtonOption } from './radio-button-option.model';
import { ArrayItemState } from './array-item-state';
import { FileWithId } from './file-with-id.model';
import { ReplyScheme, ReplySubmissionGroups } from 'src/app/api-services/chpqa-api/generated';

export interface SubmissionSectionStatusDetailed extends ReplySubmissionGroups {
  disabled: boolean;
}

export interface Manufacturer {
  id?: string;
  name: string;
  statecode: number;
}

//Same with manufacturer?
export interface ManufacturerUnit {
  id?: string;
  name: string;
  statecode: number;
}

export interface Model {
  id?: string;
  name: string;
  manufacturer: Manufacturer;
}

export interface Engine {
  id?: string;
  name: string;
  model: Model;
}

export interface EngineUnitMetrics {
  totalHeatOutputKw: number;
  totalPowerCapacityKw: number;
  fuelInputKw: number;
  powerEfficiency: number;
  maxHeatToPowerRatio: number;
  maxHeatEfficiency: number;
  maxOverallEfficiency: number;
}

export interface EngineUnit extends EngineUnitMetrics {
  id?: string;
  name: string;
  manufacturer: Manufacturer;
  model: Model;
  engine: Engine;
}
export interface PrimeMover {
  id?: string;
  tagNumber: string;
  yearCommissioned: OptionItem;
  engineType: OptionItem;
  engineSubtype: OptionItem;
  mechanicalLoad: RadioButtonOption;
  manufacturer: OptionItem;
  manufacturerOther?: string;
  model: OptionItem;
  modelOther?: string;
  engineName: OptionItem;
  engineUnitOther?: string;
  totalHeatOutputKw: number;
  totalPowerCapacityKw: number;
  fuelInputKw: number;
  powerEfficiency: number;
  maxHeatToPowerRatio: number;
  maxHeatEfficiency: number;
  maxOverallEfficiency: number;
  comments: string;
  files: FileWithId[];
  customUnit: boolean;
  state: ArrayItemState;
  index: number;
  deletedFileIds: string[];
  name: string;
}

export interface AdditionalEquipment {
  id?: string;
  name: string;
  manufacturerUnit: ManufacturerUnit;
  manufacturer: string;
  model: string;
  numberInstalled: number;
  usageFrequency: number;
  estimatedEnergyConsumptionKwe: number;
  estimatedEnergyConsumptionKwth: number;
  comments: string;
}

export interface Meter {
  id?: string;
  tagNumber: string;
  serialNumber: string;
  meterType: OptionItem;
  yearInstalled: OptionItem;
  existingOrProposed: RadioButtonOption;
  measureType: RadioButtonOption;
  fiscal: boolean;
  fiscalPoint?: number;
  meteredService?: number;
  meteredServiceF2s?: number;
  outputRangeMin: number;
  outputRangeMax: number;
  outputUnit: OptionItem;
  outputUnitOther?: string;
  uncertainty?: number;
  comments: string;
  files: FileWithId[];
  state: ArrayItemState;
  index: number;
  deletedFileIds: string[];
  name: string;
}

export interface SubmissionFile {
  id?: string;
  name: string;
  file: string;
  type: string;
}

export interface FinancialBenefitsData {
  annualClimateChangeLevyAmount?: number;
  annualCarbonPriceSupportAmount?: number;
  annualRenewableHeatIncentiveUpliftAmount?: number;
  annualRenewablesObligationCertificateAmount?: number;
  annualContractsForDifferenceAmount?: number;
  annualBusinessRatesReductionAmount?: number;
}

export interface FormSubmission {
  id?: string;
  name?: string;
  version?: string;
  scheme: ReplyScheme;
  submissionFormType: SubmissionFormType;
  year?: string;
  annualHeatProfileExists?: boolean; //where is this set?
  dailyHeatProfileExists?: boolean; //where is this set?
  equipmentList?: PrimeMover[];
  additionalEquipmentList?: AdditionalEquipment[];
  chpFuelBillingPeriod?: number; //where is this set?
  chpFuelBillingPeriodOther?: string; //where is this set?
  chpMaxHeat?: number;
  chpTotalPowerCapacity?: number;
  chpTotalHeatCapacity?: number;
  economicSector?: number;
  heatLoadDurationCurveExists?: boolean; //where is this set?
  meterList?: Meter[];
  sectionStatusList?: ReplySubmissionGroups[];
  schemeApplyingForCertificationIsExisting?: boolean; //where is this set?
  schemeEnergyFlowDiagramExists?: boolean; //where is this set?
  schemeLineDiagramExists?: boolean; //where is this set?
  totalPowCapUnderMaxHeatConds?: number;
  totalKweNormRun?: number;
  totalKwthNormRun?: number;
  heatRejectionFacility?: boolean;
  totalHeatExported?: number;
  annualClimateChangeLevyAmount?: number;
  annualCarbonPriceSupportAmount?: number;
  annualRenewableHeatIncentiveUpliftAmount?: number;
  annualRenewablesObligationCertificateAmount?: number;
  annualContractsForDifferenceAmount?: number;
  annualBusinessRatesReductionAmount?: number;
  totalFuelEnergyInputs?: number;
  totalPowerGenerated?: number;
  qualifyingHeatOutput?: number;
  powerEfficiency?: number;
  heatEfficiency?: number;
  powerEfficiencyThreshold?: number;
  achivePowerEfficiencyThreshold?: boolean;
  estimatedTotalFuelEnergyPrimeEngines?: number;
  estimatedTotalFuelEnergyBoilers?: number;
  estimatedTotalHeatOutputUsedInthePrimeMovers?: number;
  estimatedTotalHeatOutputUsedIntheBoilers?: number;
  zRatioDetermined?: true;
  possibleToDetermineZRatio?: string;
  steamExportPressure?: number;
  steamturbinesize?: number;
  zratio?: number;
  sumFnX?: number;
  sumFnY?: number;
  qualityIndexThresholdAchived?: boolean;
  qualityIndex?: number;
  rocscfdSumFnX?: number;
  rocscfdsumFnY?: number;
  rocscfdQualityIndex?: number;
  rocscfdQualityIndexThresholdAchived?: boolean;
  qualityIndexThreshold?: number;
}
