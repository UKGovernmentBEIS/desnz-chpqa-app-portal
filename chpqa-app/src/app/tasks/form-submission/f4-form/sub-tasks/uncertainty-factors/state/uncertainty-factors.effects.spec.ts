import { UncertaintyFactorsEffects } from './uncertainty-factors.effects';
import { UncertaintyFactorsActions } from './uncertainty-factors.actions';
import { provideMockActions } from '@ngrx/effects/testing';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { Observable, of, throwError } from 'rxjs';
import { ChqpaApiServiceWrapper } from '../../../../../../api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { FormSubmissionService } from '@shared/services/form-submission.service';
import { Store, select } from '@ngrx/store';
import { mockProvider } from '@ngneat/spectator/jest';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { UncertaintyFactorsRouting } from '../config/uncertainty-factors.routing';
import * as SharedActions from '../../../../../../shared/store/shared.action';

describe('UncertaintyFactorsEffects', () => {
  let spectator: SpectatorService<UncertaintyFactorsEffects>;
  let actions$: Observable<any>;

  const createEffect = createServiceFactory({
    service: UncertaintyFactorsEffects,
    providers: [
      provideMockActions(() => actions$),
      mockProvider(ChqpaApiServiceWrapper),
      mockProvider(FormSubmissionService),
      mockProvider(Store, {
        select: jest.fn().mockReturnValue(of('123')),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createEffect();
  });

  it('should dispatch submitUncertaintyFactorsInputsSuccess on success', () => {
    const mockPayload = { } as any;
    const mockResponse = { } as any;
    const chqpaApiServiceWrapper = spectator.inject(ChqpaApiServiceWrapper);

    jest.spyOn(chqpaApiServiceWrapper.updateUncertaintyService, 'apiUpdateUncertaintyPost').mockReturnValue(of(mockResponse));

    actions$ = of(UncertaintyFactorsActions.submitUncertaintyFactorsInputs({ payload: mockPayload }));

    spectator.service.submitUncertaintyFactorsInputs$.subscribe(action => {
      expect(action).toEqual(UncertaintyFactorsActions.submitUncertaintyFactorsInputsSuccess({ response: mockResponse }));
    });
  });

  it('should dispatch submitUncertaintyFactorsInputsFailure on error', () => {
    const mockPayload = { } as any;
    const mockError = { message: 'error' };
    const chqpaApiServiceWrapper = spectator.inject(ChqpaApiServiceWrapper);

    jest.spyOn(chqpaApiServiceWrapper.updateUncertaintyService, 'apiUpdateUncertaintyPost').mockReturnValue(throwError(mockError));

    actions$ = of(UncertaintyFactorsActions.submitUncertaintyFactorsInputs({ payload: mockPayload }));

    spectator.service.submitUncertaintyFactorsInputs$.subscribe(action => {
      expect(action).toEqual(UncertaintyFactorsActions.submitUncertaintyFactorsInputsFailure({ error: mockError }));
    });
  });

  it('should navigate to the correct URL on submitUncertaintyFactorsInputsSuccess', () => {
    const mockResponse = {};
    const mockSubmissionId = '123';
    const formSubmissionService = spectator.inject(FormSubmissionService);
    const store = spectator.inject(Store);

    jest.spyOn(formSubmissionService, 'getSubmissionForm').mockReturnValue(of(mockResponse));

    actions$ = of(UncertaintyFactorsActions.submitUncertaintyFactorsInputsSuccess({ response: mockResponse }));

    spectator.service.submitUncertaintyFactorsInputsSuccess$.subscribe(action => {
      expect(action).toEqual(
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${mockSubmissionId}/${UncertaintyFactorsRouting.PROVIDE_UNCERTAINTY_FACTORS_UPLOAD}`,
        })
      );
    });

    expect(store.select).toHaveBeenCalledWith(mockSubmissionId);
  });

  it('should log error on submitUncertaintyFactorsInputsFailure', () => {
    const mockError = { message: 'error' };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    actions$ = of(UncertaintyFactorsActions.submitUncertaintyFactorsInputsFailure({ error: mockError }));

    spectator.service.submitUncertaintyFactorsInputsFailure$.subscribe(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to submit Uncertainty Factors Inputs', mockError);
    });
  });

  it('should navigate to the summary page on submitUncertaintyFactorsUploadSuccess', () => {
    const mockSubmissionId = '123';
    const store = spectator.inject(Store);

    actions$ = of(UncertaintyFactorsActions.submitUncertaintyFactorsUploadSuccess({ response: {} }));

    spectator.service.submitUncertaintyFactorsUploadSuccess$.subscribe(action => {
      expect(action).toEqual(
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${mockSubmissionId}/${UncertaintyFactorsRouting.PROVIDE_UNCERTAINTY_FACTORS_SUMMARY}`,
        })
      );
    });

    expect(store.select).toHaveBeenCalledWith(mockSubmissionId);
  });
});
