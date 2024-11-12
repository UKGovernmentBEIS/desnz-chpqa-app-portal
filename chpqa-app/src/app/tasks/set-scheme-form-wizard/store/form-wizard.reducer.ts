import { createFeature, createReducer, on } from "@ngrx/store";
import * as FormWizardActions from './form-wizard.actions'
import * as SharedActions from '@shared/store/shared.action';

export interface State {
  isOperational: boolean | null;
  meetsCriteria: boolean | null;
}

export const initialState: State = {
  isOperational: true,
  meetsCriteria: null
};

export const formWizardFeatureKey = 'formWizardFeature';

export const reducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState
  })),
  on(
    FormWizardActions.setIsOperational,
    (state, { isOperational }) => ({
      ...state,
      isOperational
    })
  ),
  on(
    FormWizardActions.setMeetsCriteria,
    (state, { meetsCriteria }) => ({
      ...state,
      meetsCriteria
    })
  )
);

export const formWizardFeature = createFeature({
  name: formWizardFeatureKey,
  reducer
});