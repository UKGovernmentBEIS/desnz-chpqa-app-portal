import { Action, createReducer, on } from '@ngrx/store';
import * as SharedActions from '@shared/store/shared.action';
import { Documentation } from 'src/app/tasks/form-submission/f2-form/models/documentation.model';
import { UncertaintyFactors } from '../config/uncertainty-factors.model';
import { UncertaintyFactorsActions } from './uncertainty-factors.actions';

export interface UncertaintyFactorsState {
  uncertaintyFactorsUploadedDocuments: Documentation;
  uncertaintyFactorsValues: UncertaintyFactors;
}

export const initialState: UncertaintyFactorsState = {
  uncertaintyFactorsUploadedDocuments: {
    files: [],
    comments: '',
    deletedFileIds: [],
  },
  uncertaintyFactorsValues: {
    foi: null,
    foh: null,
    fop: null,
  },
};

export const uncertaintyFactorsReducer = createReducer(
  initialState,
  on(SharedActions.resetToInitialState, () => ({
    ...initialState,
  })),

  on(UncertaintyFactorsActions.setUncertaintyFactorsUploadedDocuments, (state, { uncertaintyFactorsUploadedDocuments }) => ({
    ...state,
    uncertaintyFactorsUploadedDocuments: uncertaintyFactorsUploadedDocuments,
  })),

  on(UncertaintyFactorsActions.setUncertaintyFactorsValues, (state, { uncertaintyFactorsValues }) => ({
    ...state,
    uncertaintyFactorsValues: uncertaintyFactorsValues,
  }))
);

export function reducer(state: UncertaintyFactorsState | undefined, action: Action) {
  return uncertaintyFactorsReducer(state, action);
}
