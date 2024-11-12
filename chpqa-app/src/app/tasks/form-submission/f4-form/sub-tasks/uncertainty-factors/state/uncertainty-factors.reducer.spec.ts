import { uncertaintyFactorsReducer, initialState, UncertaintyFactorsState } from './uncertainty-factors.reducer';
import { UncertaintyFactorsActions } from './uncertainty-factors.actions';
import { RemoteData, notAsked, inProgress, success, failure } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';
import { Uncertainty, FileWithComment } from 'src/app/api-services/chpqa-api/generated';

describe('UncertaintyFactorsReducer', () => {
  let initialState: UncertaintyFactorsState;

  beforeEach(() => {
    initialState = {
      apiUpdateUncertaintyPost: notAsked(),
      apiUploadFilesPost: notAsked(),
      apiLoadUploadedDocuments: notAsked(),
      apiSetUncertaintyFactorsSectionAsComplete: notAsked(),
    };
  });

  it('should handle submitUncertaintyFactorsInputs action', () => {
    const action = UncertaintyFactorsActions.submitUncertaintyFactorsInputs({ payload: {} as Uncertainty });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiUpdateUncertaintyPost).toEqual(inProgress());
  });

  it('should handle submitUncertaintyFactorsInputsSuccess action', () => {
    const mockResponse: Uncertainty = { } as any;
    const action = UncertaintyFactorsActions.submitUncertaintyFactorsInputsSuccess({ response: mockResponse });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiUpdateUncertaintyPost).toEqual(success(mockResponse));
  });

  it('should handle submitUncertaintyFactorsInputsFailure action', () => {
    const mockError: HttpErrorResponse = new HttpErrorResponse({ error: 'error' });
    const action = UncertaintyFactorsActions.submitUncertaintyFactorsInputsFailure({ error: mockError });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiUpdateUncertaintyPost).toEqual(failure(mockError));
  });

  it('should handle submitUncertaintyFactorsUpload action', () => {
    const action = UncertaintyFactorsActions.submitUncertaintyFactorsUpload({ payload: {} as any });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiUploadFilesPost).toEqual(inProgress());
  });

  it('should handle submitUncertaintyFactorsUploadSuccess action', () => {
    const mockResponse: any = {};
    const action = UncertaintyFactorsActions.submitUncertaintyFactorsUploadSuccess({ response: mockResponse });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiUploadFilesPost).toEqual(success(mockResponse));
  });

  it('should handle submitUncertaintyFactorsUploadFailure action', () => {
    const mockError: HttpErrorResponse = new HttpErrorResponse({ error: 'error' });
    const action = UncertaintyFactorsActions.submitUncertaintyFactorsUploadFailure({ error: mockError });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiUploadFilesPost).toEqual(failure(mockError));
  });

  it('should handle loadUncertaintyFactorsUploadedDocuments action', () => {
    const action = UncertaintyFactorsActions.loadUncertaintyFactorsUploadedDocuments(null);
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiLoadUploadedDocuments).toEqual(inProgress());
  });

  it('should handle loadUncertaintyFactorsUploadedDocumentsSuccess action', () => {
    const mockResponse: FileWithComment[] = [{}];
    const action = UncertaintyFactorsActions.loadUncertaintyFactorsUploadedDocumentsSuccess({ response: mockResponse });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiLoadUploadedDocuments).toEqual(success(mockResponse));
  });

  it('should handle loadUncertaintyFactorsUploadedDocumentsFailure action', () => {
    const mockError: HttpErrorResponse = new HttpErrorResponse({ error: 'error' });
    const action = UncertaintyFactorsActions.loadUncertaintyFactorsUploadedDocumentsFailure({ error: mockError });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiLoadUploadedDocuments).toEqual(failure(mockError));
  });

  it('should handle setUncertaintyFactorsSectionAsComplete action', () => {
    const action = UncertaintyFactorsActions.setUncertaintyFactorsSectionAsComplete({ payload: {} as any });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiSetUncertaintyFactorsSectionAsComplete).toEqual(inProgress());
  });

  it('should handle setUncertaintyFactorsSectionAsCompleteSuccess action', () => {
    const mockResponse: any = {};
    const action = UncertaintyFactorsActions.setUncertaintyFactorsSectionAsCompleteSuccess({ response: mockResponse });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiSetUncertaintyFactorsSectionAsComplete).toEqual(success(mockResponse));
  });

  it('should handle setUncertaintyFactorsSectionAsCompleteFailure action', () => {
    const mockError: HttpErrorResponse = new HttpErrorResponse({ error: 'error' });
    const action = UncertaintyFactorsActions.setUncertaintyFactorsSectionAsCompleteFailure({ error: mockError });
    const state = uncertaintyFactorsReducer(initialState, action);

    expect(state.apiSetUncertaintyFactorsSectionAsComplete).toEqual(failure(mockError));
  });
});
