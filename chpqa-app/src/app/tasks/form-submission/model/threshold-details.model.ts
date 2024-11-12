export enum ThresholdDetailsHeader {
    PowerEfficiencyConditionsMet,
    PowerEfficiencyConditionsNotMet,
    QualityIndexConditionsMet,
    QualityIndexConditionsNotMet
}

export enum ThresholdDetailsBody {
    PowerEfficiencyConditionsMet,
    PowerEfficiencyConditionsNotMet,
    QualityIndexConditionsMet,
    QualityIndexConditionsNotMet
}

export enum ThresholdDetailsCalculations {
    F4Simple, F4Complex
}

export type ThresholdDetails = {
    header?: ThresholdDetailsHeader;
    body?: ThresholdDetailsBody;
    calculations?: ThresholdDetailsCalculations;
}