import { ReplyEnergyInput } from 'src/app/api-services/chpqa-api/generated';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { EnergyInput, HeatMonitoring, HeatType, PowerOutput, PowerType } from '../models/f4-form.model';
import { Months } from '@shared/enums/months.enum';
import { PerformanceSummary } from '@shared/models/summary-lists';

export const calculateHeatOutputTotals = (heatOutputs: HeatMonitoring[]) => {
  return heatOutputs.reduce(
    (totals, output) => {
      if (output.includeInCalculations?.value) {
        totals.qualifyingHeatOutput += output.annualTotal;
        if (parseInt(output.type.id) === HeatType.Exported) {
          totals.totalHeatOutputs += output.annualTotal;
        }
      }
      return totals;
    },
    {
      qualifyingHeatOutput: 0,
      totalHeatOutputs: 0,
    }
  );
};

export const calculatePowerOutputsTotals = (powerOutputs: PowerOutput[]) => {
  return powerOutputs.reduce(
    (totals, output) => {
      if (output.includeInCalculations?.value) {
        totals.total += output.annualTotal;
        if (parseInt(output.type.id) === PowerType.Imported) {
          totals.totalImportedPower += output.annualTotal;
        } else if (parseInt(output.type.id) === PowerType.Exported) {
          totals.totalExportedPower += output.annualTotal;
        }
      }
      return totals;
    },
    {
      total: 0,
      totalExportedPower: 0,
      totalImportedPower: 0,
    }
  );
};

export const calculateTotalEnergyInputs = (energyInputs: EnergyInput[]) => {
  return energyInputs.reduce((total, input) => {
    if (input.includeInCalculations?.value) {
      return total + input.annualTotal;
    }
    return total;
  }, 0);
};

export const calculateTfiEnergyInputs = (annualTotal: number, totalEnergyInputs: number, includeInCalculations: boolean) => {
  if (totalEnergyInputs === 0 || !includeInCalculations) return null;
  return (annualTotal / totalEnergyInputs) * 100;
};

export const mapMonths = (response: ReplyEnergyInput): { [key in Months]: number } => {
  return {
    january: response?.january,
    february: response?.february,
    march: response?.march,
    april: response?.april,
    may: response?.may,
    june: response?.june,
    july: response?.july,
    august: response?.august,
    september: response?.september,
    october: response?.october,
    november: response?.november,
    december: response?.december,
  };
};

export const isF4Simple = (submissionFormType: SubmissionFormType) => {
  return submissionFormType === SubmissionFormType.F4s;
};

export const isF4Complex = (submissionFormType: SubmissionFormType) => {
  return submissionFormType === SubmissionFormType.F4;
};

export const isF4 = (submissionFormType: SubmissionFormType) => {
  return submissionFormType === SubmissionFormType.F4 || submissionFormType === SubmissionFormType.F4s;
};

export const mapPerformanceSummary = (
  tag: string,
  serialNumber: string,
  category: string,
  type: string,
  includeInCalculations: boolean,
  annualTotal: number,
  changeLocation: string,
  tfi?: number
): PerformanceSummary => {
  return {
    tag: tag,
    serialNumber: serialNumber,
    category: category,
    type: type,
    includeInCalculations: includeInCalculations,
    annualTotal: annualTotal,
    changeLocation: changeLocation,
    tfi
  };
};
