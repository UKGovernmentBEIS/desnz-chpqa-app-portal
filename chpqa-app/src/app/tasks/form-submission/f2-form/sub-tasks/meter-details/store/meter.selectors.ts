import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Meter } from '@shared/models/form-submission.model';

export const selectMeterRequest = createFeatureSelector<Meter>('meter');

export const selectMeter = createSelector(selectMeterRequest, meter => meter);

export const selectMeterDetails = createSelector(selectMeterRequest, meter => ({
  tagNumber: meter?.tagNumber,
  serialNumber: meter?.serialNumber,
  yearInstalled: meter?.yearInstalled,
}));

export const selectMeterType = createSelector(
  selectMeterRequest,
  meter => meter?.meterType
);

export const selectMeterExistance = createSelector(
  selectMeterRequest,
  meter => meter?.existingOrProposed
);

export const selectMeterMeasurement = createSelector(
  selectMeterRequest,
  meter => meter?.measureType
);

export const selectMeterOutput = createSelector(selectMeterRequest, meter => ({
  outputRangeMin: meter.outputRangeMin,
  outputRangeMax: meter.outputRangeMax,
  outputUnit: meter.outputUnit,
}));

export const selectMeterOutputOther = createSelector(
  selectMeterRequest,
  meter => meter?.outputUnitOther
);

export const selectMeterFiscal = createSelector(
  selectMeterRequest,
  meter =>({ fiscal: meter?.fiscal, fiscalPoint: meter?.fiscalPoint})
);

export const selectMeterUncertainty = createSelector(
  selectMeterRequest,
  meter => meter?.uncertainty
);

export const selectMeterDocumentation = createSelector(
  selectMeterRequest,
  meter => ({
    files: meter?.files,
    comments: meter?.comments,
  })
);

export const selectMeterComments = createSelector(
  selectMeterRequest,
  meter => meter?.comments
);

export const selectMeterFiles = createSelector(
  selectMeterRequest,
  meter => meter?.files
);

export const selectMeterDeletionInformation = createSelector(
  selectMeterRequest,
  meter => ({
    id: meter?.id,
    index: meter?.index,
    name: meter?.name
  })
);

export const selectMeterIndex = createSelector(
  selectMeterRequest,
  meter => meter?.index
);

