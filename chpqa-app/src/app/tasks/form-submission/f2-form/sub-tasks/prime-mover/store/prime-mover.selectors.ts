import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PrimeMover } from '@shared/models/form-submission.model';

export const selectPrimeMover = createFeatureSelector<PrimeMover>('primeMover');

export const selectPrimeMoverTagNumber = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.tagNumber
);

export const selectPrimeMoverYearCommissioned = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.yearCommissioned
);

export const selectPrimeMoverMechanicalLoad = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.mechanicalLoad
);

export const selectPrimeMoverType = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.engineType
);

export const selectPrimeMoverSubtype = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.engineSubtype
);

export const selectPrimeMoverEngineManufacturer = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.manufacturer
);

export const selectPrimeMoverEngineManufacturerOther = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.manufacturerOther
);

export const selectPrimeMoverEngineModel = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.model
);

export const selectPrimeMoverEngineModelOther = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.modelOther
);

export const selectPrimeMoverEngineName = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.engineName
);

export const selectPrimeMoverEngineOther = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.engineUnitOther
);

export const selectPrimeMoverCustomUnit = createSelector(
  selectPrimeMover,
  primeMover => primeMover?.customUnit
);

export const selectPrimeMoverDocumentation = createSelector(
  selectPrimeMover,
  primeMover => ({
    comments: primeMover.comments,
    files: primeMover.files,
  })
);

export const selectPrimeMoverEngineMetrics = createSelector(
  selectPrimeMover,
  primeMover => ({
    totalPowerCapacityKw: primeMover.totalPowerCapacityKw,
    totalHeatOutputKw: primeMover.totalHeatOutputKw,
    powerEfficiency: primeMover.powerEfficiency,
    maxHeatToPowerRatio: primeMover.maxHeatToPowerRatio,
    maxHeatEfficiency: primeMover.maxHeatEfficiency,
    maxOverallEfficiency: primeMover.maxOverallEfficiency,
    fuelInputKw: primeMover.fuelInputKw,
  })
);

export const selectPrimeMoverDeletionInformation = createSelector(
  selectPrimeMover,
  primeMover => ({
    id: primeMover?.id,
    index: primeMover?.index,
    name: primeMover?.name
  })
);