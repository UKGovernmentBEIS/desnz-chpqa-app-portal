import { createAction, props } from '@ngrx/store';
import { UncertaintyAdjustmentFactors } from 'src/app/tasks/form-submission/f2-form/models/documentation.model';
import { UncertaintyFactors } from '../config/uncertainty-factors.model';


export const setUncertaintyFactorsUploadedDocuments = createAction(
  '[AdjustmentFactorsUploadComponent] Submit Uncertainty Factors',
  props<{ uncertaintyFactorsUploadedDocuments: UncertaintyAdjustmentFactors }>()
);

export const setUncertaintyFactorsValues = createAction(
  '[AdjustmentFactorsInputsComponent] Submit Uncertainty Factors Valid Inputs',
  props<{ uncertaintyFactorsValues: UncertaintyFactors }>()
);

export const submitUncertaintyFactors = createAction(
  '[AdjustmentFactorsReviewComponent] Submit Uncertainty Factors'
);

export const UncertaintyFactorsActions = {
  setUncertaintyFactorsUploadedDocuments,
  setUncertaintyFactorsValues,
  submitUncertaintyFactors
};
