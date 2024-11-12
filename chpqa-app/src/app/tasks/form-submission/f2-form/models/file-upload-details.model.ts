import { Status } from "@shared/enums/status.enum";

export interface BasicFileUploadDetails {
  base64String: string;
  entity: string;
  attributeName: string;
  parentEntity: string;
  parentAttributeName: string;
  fileName: string;
  mimeType: string;
  comments?: string;
  entityId: string;
  groupStatus?: Status;
  groupId?: string;
}

export enum DiagramType {
  EnergyFlowDiagram = 0,
  SchemeLineDiagram = 1,
  AnnualHeatProfile = 2,
  DailyHeatProfile = 3,
  HeatLoadDurationCurve = 4,
}

export interface DiagramFileUploadDetails extends BasicFileUploadDetails {
  diagramType: DiagramType;
}

export type SchemeEnergyFlowFileUpload = DiagramFileUploadDetails;
export type SchemeLineFileUpload = DiagramFileUploadDetails;
export type AnnualHeatProfileFileUpload = DiagramFileUploadDetails;
export type DailyHeatProfileFileUpload = DiagramFileUploadDetails;
export type HeatLoadDurationCurveFileUpload = DiagramFileUploadDetails;
export type EquipmentFileUpload = BasicFileUploadDetails;
export type MetersFileUpload = BasicFileUploadDetails;