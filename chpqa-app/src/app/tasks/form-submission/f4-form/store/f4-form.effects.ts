import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { Status } from '@shared/enums/status.enum';
import { selectSelectedScheme, selectSubmissionFormId } from '@shared/store';
import { catchError, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { UpdateHoursOfOp } from 'src/app/api-services/chpqa-api/generated/model/updateHoursOfOp';
import * as SharedActions from '@shared/store/shared.action';
import { FormSubmissionPath } from '../../model/form-submission-path.model';
import { SubmitToAssessorService } from '../../services/submit-to-assessor.service';
import * as FormSubmissionsActions from '../../store/form-submission.actions';
import {
  selectFormSubmissionType,
  selectSubmissionForm,
  selectSubmissionGroupId,
  selectTotalFuelEnergyBoilers,
  selectTotalFuelEnergyPrimeEngines,
  selectTotalHeatOutputBoilers,
  selectTotalHeatOutputPrimeMovers,
} from '../../store/form-submission.selectors';
import { CertificatesAndBenefitsService } from '../services/certificates-and-benefits.service';
import { CondensingSteamTurbineService } from '../services/condensing-steam-turbine.service';
import { EnergyInputsService } from '../services/energy-inputs.service';
import { PowerOutputService } from '../services/power-output.service';
import { QualityIndexThresholdService } from '../services/quality-index-threshold.service';
import { SchemePerformanceDetailsService } from '../services/scheme-performance-details.service';
import { HeatMonitoringDataService } from '../sub-tasks/heat-monitoring-data/heat-monitoring-data.service';
import * as F4FormActions from './f4-form.actions';
import {
  selectCondensingSteamTurbine,
  selectEnergyInputs,
  selectEnergyInputsStatus,
  selectHeatOutputs,
  selectHeatOutputsStatus,
  selectHoursOfOperation,
  selectPowerOutputs,
  selectPowerOutputsStatus,
  selectQualityIndexThreshold,
  selectRequestCfdCertificate,
  selectRequestRocCertificate,
  selectRequestSoSCertificate,
  selectTotalEnergyInputs,
  selectTotalMetricsHeatOutputs,
  selectTotalPowerOutputs,
} from './f4-form.selectors';
import { HoursOfOperationService } from '../sub-tasks/hours-of-operation/services/hours-of-operation.service';

@Injectable()
export class F4FormEffects {
  submitHoursOfOperation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitHoursOfOperation),
      withLatestFrom(this.store.select(selectHoursOfOperation), this.store.select(selectSubmissionFormId), this.store.select(selectSubmissionGroupId)),
      switchMap(([action, hoursOfOperation, submissionFormId, groupId]) => {
        const payload: UpdateHoursOfOp = {
          idSubmission: submissionFormId,
          hoursOfOperation: hoursOfOperation.hoursOfOperation,
          months: hoursOfOperation?.months,
        };
        return this.hoursOfOperationService.onSubmit(payload).pipe(
          map(() =>
            SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`,
            })
          )
        );
      })
    );
  });

  fetchEnergyInputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormSubmissionsActions.fetchEnergyInputs),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionId]) =>
        this.energyInputsService.fetchEnergyInputs(submissionId).pipe(map(energyInputs => F4FormActions.setEnergyInputs({ energyInputs })))
      )
    )
  );

  setEnergyInput$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.setEnergyInput),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.ENTER_ENERGY_INPUTS}`,
        })
      )
    )
  );

  setEnergyInputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.setEnergyInputs),
      map(() => F4FormActions.calculateEnergyInputTotals())
    )
  );

  updateEnergyInputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.updateEnergyInputs),
      map(() => F4FormActions.calculateEnergyInputTotals())
    )
  );

  calculateEnergyInputTotalsCompleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.calculateEnergyInputTotals),
      map(() => F4FormActions.calculateEnergyInputsTFIs())
    )
  );

  submitEnergyInputs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitEnergyInputs),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectTotalEnergyInputs)),
        this.store.pipe(select(selectEnergyInputs)),
        this.store.pipe(select(selectSubmissionForm)),
        this.store.pipe(select(selectFormSubmissionType)),
        this.store.pipe(select(selectTotalFuelEnergyPrimeEngines)),
        this.store.pipe(select(selectTotalFuelEnergyBoilers)),
        this.store.pipe(select(selectEnergyInputsStatus))
      ),
      mergeMap(
        ([
          action,
          submissionId,
          totalEnergyInputs,
          energyInputs,
          submissionForm,
          formSubmissionType,
          estimatedTotalFuelEnergyPrimeEngines,
          estimatedTotalFuelEnergyBoilers,
          energyInputsStatus,
        ]) => {
          return this.energyInputsService
            .submitEnergyInputs(
              submissionId,
              totalEnergyInputs,
              energyInputs,
              submissionForm?.chpTotalPowerCapacity,
              formSubmissionType,
              estimatedTotalFuelEnergyPrimeEngines,
              estimatedTotalFuelEnergyBoilers
            )
            .pipe(
              switchMap(() => [F4FormActions.submitEnergyInputsSuccess(), F4FormActions.resetEnergyInputs()]),
              catchError(error => of(F4FormActions.submitEnergyInputsFail({ error })))
            );
        }
      )
    );
  });

  submitEnergyInputSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitEnergyInputsSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  fetchPowerOutputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormSubmissionsActions.fetchPowerOutputs),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionId]) =>
        this.powerOutputService.fetchPowerOutputs(submissionId).pipe(map(powerOutputs => F4FormActions.setPowerOutputs({ powerOutputs })))
      )
    )
  );

  setPowerOutputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.setPowerOutputs),
      map(() => F4FormActions.calculatePowerOutputsTotals())
    )
  );

  setPowerOutput$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.setPowerOutput),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.ENTER_POWER_OUTPUT}`,
        })
      )
    )
  );

  updatePowerOutputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.updatePowerOutputs),
      map(() => F4FormActions.calculatePowerOutputsTotals())
    )
  );

  submitPowerOutputs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitPowerOutputs),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectSubmissionGroupId)),
        this.store.pipe(select(selectTotalPowerOutputs)),
        this.store.pipe(select(selectPowerOutputs)),
        this.store.pipe(select(selectPowerOutputsStatus))
      ),
      mergeMap(([action, submissionId, groupId, totalPowerOutputs, powerOutputs, powerOutputsStatus]) => {
        return this.powerOutputService
          .submitPowerOutputs(
            submissionId,
            groupId,
            powerOutputsStatus ? Status.Completed : Status.InProgress,
            totalPowerOutputs.total,
            totalPowerOutputs.totalExportedPower,
            totalPowerOutputs.totalImportedPower,
            powerOutputs
          )
          .pipe(
            switchMap(() => [F4FormActions.submitPowerOutputsSuccess(), F4FormActions.resetPowerOutputs()]),
            catchError(error => of(F4FormActions.submitPowerOutputsFail({ error })))
          );
      })
    );
  });

  submitPowerOutputSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitPowerOutputsSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  fetchHeatOutputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormSubmissionsActions.fetchHeatOutputs),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      mergeMap(([action, submissionId]) =>
        this.heatMonitoringDataService.fetchHeatOutputs(submissionId).pipe(
          map(heatOutputs => F4FormActions.setHeatOutputs({ heatOutputs })),
          catchError(error => {
            console.error('Failed to fetch heat outputs:', error);
            return of(F4FormActions.fetchHeatOutputsFail({ error }));
          })
        )
      )
    )
  );

  setHeatOutput$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.setHeatOutput),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.ENTER_HEAT_OUTPUT}/${action.index}`,
        })
      )
    )
  );

  setHeatOutputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.setHeatOutputs),
      map(() => F4FormActions.calculateHeatOutputsTotals())
    )
  );

  updateHeatOutputs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(F4FormActions.updateHeatOutputs),
      map(() => F4FormActions.calculateHeatOutputsTotals())
    )
  );

  submitHeatOutputs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitHeatOutputs),
      withLatestFrom(
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId),
        this.store.select(selectHeatOutputs),
        this.store.select(selectTotalMetricsHeatOutputs),
        this.store.select(selectHeatOutputsStatus),
        this.store.pipe(select(selectTotalHeatOutputPrimeMovers)),
        this.store.pipe(select(selectTotalHeatOutputBoilers))
      ),
      mergeMap(
        ([action, submissionId, groupId, heatOutputs, totalMetricsHeatOutputs, heatOutputsStatus, totalHeatOutputPrimeMovers, totalHeatOutputBoilers]) => {
          return this.heatMonitoringDataService
            .submitHeatOutputs(
              submissionId,
              groupId,
              heatOutputsStatus ? Status.Completed : Status.InProgress,
              heatOutputs,
              totalMetricsHeatOutputs.totalHeatOutputs,
              totalMetricsHeatOutputs.qualifyingHeatOutput,
              totalHeatOutputPrimeMovers,
              totalHeatOutputBoilers
            )
            .pipe(map(() => F4FormActions.submitHeatOutputsSuccess()));
        }
      )
    );
  });

  submitHeatOutputsSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitHeatOutputsSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  submitCondensingSteamTurbine$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitCondensingSteamTurbine),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectSubmissionGroupId)),
        this.store.pipe(select(selectCondensingSteamTurbine))
      ),
      mergeMap(([action, submissionId, groupId, condensingSteamTurbine]) => {
        return this.condensingSteamTurbineService.submitCondensingSteamTurbine(submissionId, groupId, Status.Completed, condensingSteamTurbine).pipe(
          map(() => F4FormActions.submitCondensingSteamTurbineSuccess()),
          catchError(error => of(F4FormActions.submitCondensingSteamTurbineFailure({ error })))
        );
      })
    );
  });

  submitCondensingSteamTurbineSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitCondensingSteamTurbineSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  submitRequestSoSCertificate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitRequestSoSCertificate),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectSubmissionGroupId)),
        this.store.pipe(select(selectRequestSoSCertificate))
      ),
      mergeMap(([action, formSubmissionId, groupId, requestSoSCertificate]) => {
        return this.certificatesAndBenefitsService.submitRequestForSoSCertificate(formSubmissionId, groupId, requestSoSCertificate).pipe(
          map(() => F4FormActions.submitRequestSoSCertificateSuccess()),
          catchError(error => of(F4FormActions.submitRequestSoSCertificateFailure()))
        );
      })
    );
  });

  submitRequestRocCertificate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitRequestRocCertificate),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectSubmissionGroupId)),
        this.store.pipe(select(selectRequestRocCertificate))
      ),
      mergeMap(([action, formSubmissionId, groupId, requestRocCertificate]) => {
        return this.certificatesAndBenefitsService.submitRequestForRocCertificate(formSubmissionId, groupId, requestRocCertificate).pipe(
          map(() => F4FormActions.submitRequestRocCertificateSuccess()),
          catchError(error => of(F4FormActions.submitRequestRocCertificateFailure()))
        );
      })
    );
  });

  submitRequestCfdCertificate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitRequestCfdCertificate),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectSubmissionGroupId)),
        this.store.pipe(select(selectRequestCfdCertificate))
      ),
      mergeMap(([action, formSubmissionId, groupId, requestCfdCertificate]) => {
        return this.certificatesAndBenefitsService.submitRequestForCfdCertificate(formSubmissionId, groupId, requestCfdCertificate).pipe(
          map(() => F4FormActions.submitRequestCfdCertificateSuccess()),
          catchError(error => of(F4FormActions.submitRequestCfdCertificateFailure()))
        );
      })
    );
  });

  submitRequestCertificateSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        F4FormActions.submitRequestSoSCertificateSuccess,
        F4FormActions.submitRequestRocCertificateSuccess,
        F4FormActions.submitRequestCfdCertificateSuccess
      ),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  setAggreeToTerms$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.setAggreeToTerms),
      map(action => {
        return F4FormActions.submitToAssessor();
      })
    );
  });

  submitToAssessor$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitToAssessor),
      withLatestFrom(this.store.select(selectSubmissionFormId), this.store.select(selectSubmissionGroupId), this.store.select(selectSelectedScheme)),
      mergeMap(([action, submissionId, groupId, scheme]) => {
        return this.submitToAssessorService.submit(scheme, submissionId, groupId).pipe(
          map(() => F4FormActions.submitToAssessorSuccess()),
          catchError(error => of(F4FormActions.submitToAssessorFailure({ error })))
        );
      })
    );
  });

  submitToAssessorSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitToAssessorSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.SUBMIT_SUCCESS}`,
        })
      )
    );
  });

  setQualityIndexThreshold$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.setQualityIndexThreshold),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.QUALITY_INDEX_THRESHOLD_SUMMARY}`,
        })
      )
    );
  });

  submitQualityIndexThreshold$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitQualityIndexThreshold),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.select(selectSubmissionGroupId),
        this.store.pipe(select(selectQualityIndexThreshold))
      ),
      mergeMap(([action, submissionId, groupId, qualityIndexThreshold]) => {
        return this.qualityIndexThresholdService.create(submissionId, groupId, qualityIndexThreshold.value as number).pipe(
          switchMap(() => [F4FormActions.submitQualityIndexThresholdSuccess()]),
          catchError(error => {
            return of(F4FormActions.submitQualityIndexThresholdFail({ error }));
          })
        );
      })
    );
  });

  submitQualityIndexThresholdSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F4FormActions.submitQualityIndexThresholdSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
        })
      )
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private hoursOfOperationService: HoursOfOperationService,
    private readonly heatMonitoringDataService: HeatMonitoringDataService,
    private readonly energyInputsService: EnergyInputsService,
    private readonly powerOutputService: PowerOutputService,
    private readonly schemePerformanceDetailsService: SchemePerformanceDetailsService,
    private readonly certificatesAndBenefitsService: CertificatesAndBenefitsService,
    private readonly qualityIndexThresholdService: QualityIndexThresholdService,
    private readonly submitToAssessorService: SubmitToAssessorService,
    private readonly condensingSteamTurbineService: CondensingSteamTurbineService
  ) {}
}
