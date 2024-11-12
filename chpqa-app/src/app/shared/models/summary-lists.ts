import { ChangeLinkAriaLabel } from "@shared/enums/aria-label.enum";
import { FileWithId } from "./file-with-id.model";

export interface MetricsSummaryList {
  key: string;
  value: string | number | boolean;
  changeLocation?: string;
  files?: FileWithId[];
  ariaLabel: ChangeLinkAriaLabel;
}

export interface PerformanceSummary {
  tag: string;
  serialNumber: string;
  category: string;
  type: string;
  includeInCalculations: boolean;
  annualTotal: number;
  changeLocation?: string;
  tfi?:number;
}
