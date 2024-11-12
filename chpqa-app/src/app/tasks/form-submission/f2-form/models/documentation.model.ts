import { FileWithId } from "@shared/models/file-with-id.model";

export interface Documentation {
  files: FileWithId[];
  comments?: string;
  deletedFileIds?: string[];
}

export type DailyHeatProfile = Documentation;
export type AnnualHeatProfile = Documentation;
export type EnergyFlow = Documentation;
export type SchemeLineDiagram = Documentation;
export type HeatLoadDurationCurve = Documentation;
export type UncertaintyAdjustmentFactors = Documentation;