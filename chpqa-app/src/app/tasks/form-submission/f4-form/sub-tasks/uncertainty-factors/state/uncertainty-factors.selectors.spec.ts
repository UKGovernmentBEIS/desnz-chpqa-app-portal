import { UncertaintyFactorsSelectors } from './uncertainty-factors.selectors';
import { UncertaintyFactorsState } from './uncertainty-factors.reducer';
import { RemoteData, notAsked, success, failure, inProgress } from 'ngx-remotedata';
import { Uncertainty, FileWithComment } from 'src/app/api-services/chpqa-api/generated';
import { HttpErrorResponse } from '@angular/common/http';

describe('UncertaintyFactorsSelectors', () => {
  let initialState: UncertaintyFactorsState;

  beforeEach(() => {
    initialState = {
      apiUpdateUncertaintyPost: notAsked<Uncertainty, HttpErrorResponse>(),
      apiUploadFilesPost: notAsked<any, HttpErrorResponse>(),
      apiLoadUploadedDocuments: notAsked<FileWithComment[], HttpErrorResponse>(),
      apiSetUncertaintyFactorsSectionAsComplete: notAsked<any, HttpErrorResponse>(),
    };
  });

  it('should select the feature state', () => {
    const result = UncertaintyFactorsSelectors.selectUncertaintyFactorsState.projector(initialState);
    expect(result).toEqual(initialState);
  });

  it('should select apiUpdateUncertaintyPost', () => {
    const apiUpdateUncertaintyPost = success<Uncertainty, HttpErrorResponse>({} as any);
    const state = { ...initialState, apiUpdateUncertaintyPost };

    const result = UncertaintyFactorsSelectors.selectApiUpdateUncertaintyPost.projector(state);
    expect(result).toEqual(apiUpdateUncertaintyPost);
  });

  it('should select apiUploadFilesPost', () => {
    const apiUploadFilesPost = success<any, HttpErrorResponse>({});
    const state = { ...initialState, apiUploadFilesPost };

    const result = UncertaintyFactorsSelectors.selectApiUploadFilesPost.projector(state);
    expect(result).toEqual(apiUploadFilesPost);
  });

  it('should select apiLoadUploadedDocuments', () => {
    const apiLoadUploadedDocuments = success<FileWithComment[], HttpErrorResponse>([{}]);
    const state = { ...initialState, apiLoadUploadedDocuments };

    const result = UncertaintyFactorsSelectors.selectUncertaintyFactorsUploadedDocuments.projector(state);
    expect(result).toEqual(apiLoadUploadedDocuments);
  });

  it('should select apiSetUncertaintyFactorsSectionAsComplete', () => {
    const apiSetUncertaintyFactorsSectionAsComplete = success<any, HttpErrorResponse>({});
    const state = { ...initialState, apiSetUncertaintyFactorsSectionAsComplete };

    const result = UncertaintyFactorsSelectors.selectSetUncertaintyFactorsSectionAsComplete.projector(state);
    expect(result).toEqual(apiSetUncertaintyFactorsSectionAsComplete);
  });
});
