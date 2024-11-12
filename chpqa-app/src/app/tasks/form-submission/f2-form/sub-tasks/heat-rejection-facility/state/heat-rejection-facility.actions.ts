import { createAction, props } from '@ngrx/store';
import { UpdateHeatRejectionFacility } from 'src/app/api-services/chpqa-api/generated';

const setHeatRejectionFacility = createAction(
  '[HeatRejectionFacility] Set Heat Rejection Facility'
);

const setHeatRejectionFacilityAsComplete = createAction(
  '[HeatRejectionFacility] Set Heat Rejection Facility as Complete',
  props<{ payload: any }>()
);

// const submitHeatRejectionFacility = createAction(
//   '[HeatRejectionFacility] Submit Heat Rejection Facility',
//   props<{ payload: UpdateHeatRejectionFacility }>()
// );

const submitHeatRejectionFacilitySuccess = createAction(
  '[HeatRejectionFacility] Submit Heat Rejection Facility Success',
  props<{ response: any }>()
);

const submitHeatRejectionFacilityFailure = createAction(
  '[HeatRejectionFacility] Submit Heat Rejection Facility Failure',
  props<{ error: any }>()
);

export const HeatRejectionFacilityActions = {
  setHeatRejectionFacility,
  setHeatRejectionFacilityAsComplete,
  // submitHeatRejectionFacility,
  submitHeatRejectionFacilitySuccess,
  submitHeatRejectionFacilityFailure,
};
