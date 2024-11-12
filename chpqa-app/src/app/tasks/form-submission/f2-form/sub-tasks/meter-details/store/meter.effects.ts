import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import { selectSubmissionFormId } from '@shared/store';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import * as SharedActions from '@shared/store/shared.action';
import * as MeterActions from './meter.actions';
import { selectMeter, selectMeterDeletionInformation, selectMeterOutputOther, selectMeterType } from './meter.selectors';
import { FileUploadService, PayloadConstantValues } from '../../../services/file-upload.service';
import { EquipmentService } from '../../../services/equipment.service';
import { CreateOutputUnitResponse, OutputUnitService } from '../../../services/output-unit.service';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { MeterFacade } from './meter.facade';
import { downloadFile } from '@shared/shared.util';
import { Documentation } from '../../../models/documentation.model';
@Injectable()
export class MeterEffects {
  setMeterDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterDetails),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) => {
        return SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_TYPE}`,
        });
      })
    );
  });

  setMeterDocumentation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterDocumentation),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectMeter))),
      tap(([action, submissionId, meter]) => {
        if (meter.state === null) {
          this.meterFacade.addMeter(meter);
        } else {
          this.meterFacade.updateMeter(meter);
        }
      }),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_REVIEW_ANSWERS}`,
        })
      )
    );
  });

  setMeterMeasurement$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterMeasurement),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_EXISTENCE}`,
        })
      )
    );
  });

  setMeterFiscal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterFiscal),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_OUTPUT_RANGE}`,
        })
      )
    );
  });

  setMeterOutput$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterOutput),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectFormSubmissionType))),
      map(([action, submissionId, submissionFormType]) => {
        const url =
          submissionFormType === SubmissionFormType.F4s
            ? `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_DOCUMENTATION}`
            : `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_UNCERTAINTY}`;
        return SharedActions.navigateTo({
          url: url,
        });
      })
    );
  });

  setMeterCustomOutputUnit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterCustomOutputUnit),
      map(action => MeterActions.createOutputUnit())
    );
  });

  createOutputUnit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MeterActions.createOutputUnit),
      withLatestFrom(this.store.pipe(select(selectMeterOutputOther))),
      switchMap(([action, outputUnitOther]) =>
        this.outputUnitService.createOutputUnit({ outputUnitOther }).pipe(
          map((createOutputUnitResponse: CreateOutputUnitResponse) => {
            return MeterActions.createOutputUnitSuccess({
              customOutputUnit: {
                id: createOutputUnitResponse.id,
                name: outputUnitOther,
              },
            });
          }),
          catchError(error => of(MeterActions.createOutputUnitFailure({ error })))
        )
      )
    )
  );

  setMeterUncertainty$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterUncertainty),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_DOCUMENTATION}`,
        })
      )
    );
  });

  setMeterExistingOrProposed$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterExistingOrProposed),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectMeterType)), this.equipmentService.getMeterFlowTypeId()),
      map(([action, submissionId, meterType, meterFlowTypeId]) => {
        const url =
          meterType.id === meterFlowTypeId
            ? `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_FISCAL_CHECK}`
            : `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_OUTPUT_RANGE}`;
        return SharedActions.navigateTo({
          url: url,
        });
      })
    );
  });

  setMeterType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.setMeterType),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_MEASUREMENT}`,
        })
      )
    );
  });

  addAnotherMeter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.addAnotherMeter),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      switchMap(([action, submissionId]) => [
        MeterActions.resetMeterState(),
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.ADD_METER}`,
        }),
      ])
    );
  });

  downloadMeterFile$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MeterActions.downloadMeterFile),
        withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
        switchMap(([action, submissionId]) =>
          this.meterFacade.downloadMeterFile(submissionId, action.id).pipe(
            tap((fileData: any) => {
              downloadFile(fileData, action.fileName);
            }),
            catchError(error => of({ error }))
          )
        )
      );
    },
    { dispatch: false }
  );

  submitMeters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.submitMeters),
      withLatestFrom(this.meterFacade.isSubmittingMeters$),
      filter(([_, isSubmitting]) => !isSubmitting),
      switchMap(() =>
        this.meterFacade.submitMeters$().pipe(
          take(1),
          switchMap(response => {
            return [MeterActions.submitMetersSuccess({ successIds: response })];
          }),
          catchError(error => of(MeterActions.submitMetersFailure()))
        )
      )
    );
  });

  submitMetersSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.submitMetersSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.meterFacade.meters$),
      switchMap(([action, submissionId, meters]) => {
        const navigateToTaskList = [
          MeterActions.resetSubmittingMetersState(),
          SharedActions.navigateTo({
            url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
          }),
        ];

        const meterProcesses = action.successIds.map(item => {
          const meterIndex = parseInt(item.name.match(/\d+/)?.[0] || '0', 10) - 1;

          const meterFiles: Documentation = {
            files: meters[meterIndex]?.files.filter(fileWithId => !fileWithId.id) || [],
            comments: meters[meterIndex]?.comments,
            deletedFileIds: meters[meterIndex]?.deletedFileIds,
          };

          const uploadObservable =
            meterFiles.files.length > 0
              ? this.fileUploadService.metersFileUpload(meterFiles, item.id, submissionId)
              : of(null);

          const deleteObservable =
            meterFiles.deletedFileIds && meterFiles.deletedFileIds.length > 0
              ? this.fileUploadService.deleteFiles(PayloadConstantValues.MetersParentEntityProperty, meterFiles.deletedFileIds, submissionId)
              : of(null);

          return forkJoin([uploadObservable, deleteObservable]).pipe(
            catchError(error => of(error))
          );
        });

        const filteredMeterProcesses = meterProcesses.filter(process => process !== null);
        if (filteredMeterProcesses.length === 0) {
          return of(...navigateToTaskList);
        }

        return forkJoin(filteredMeterProcesses).pipe(
          map(() => navigateToTaskList),
          switchMap(actions => of(...actions)),
          catchError(error => {
            this.meterFacade.setSubmittingMetersSubject(false);
            return of(error);
          })
        );
      })
    );
  });


  resetSubmittingMetersState$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MeterActions.resetSubmittingMetersState),
        tap(() => {
          this.meterFacade.resetSubmittingMetersState();
        })
      );
    },
    { dispatch: false }
  );


  deleteMeter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.deleteMeter),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      switchMap(([action, submissionId]) => [
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_CONRFIRM_DELETION}`,
        }),
      ])
    );
  });

  confirmDeleteMeter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MeterActions.confirmDeleteMeter),
      withLatestFrom(
        this.store.pipe(select(selectSubmissionFormId)),
        this.store.pipe(select(selectMeterDeletionInformation))
      ),
      switchMap(([action, submissionId, meterDeletionInformation]) => {
        const actions = [];
        if (action.confirmDelete.value) {
          const deleteMeterObservable = this.meterFacade
            .deleteMeter(submissionId, meterDeletionInformation.index, meterDeletionInformation.id)
            .pipe(
              tap(() => this.meterFacade.showDeleteSuccessBanner()),
              catchError(error => of(error))
            );

          actions.push(deleteMeterObservable);
        }

        const navigateToReviewAnswers = [
          SharedActions.navigateTo({
            url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.METER_REVIEW_ANSWERS}`,
          }),
        ];

        if (actions.length === 0) {
          return of(...navigateToReviewAnswers);
        }

        return forkJoin(actions).pipe(
          switchMap(() => of(...navigateToReviewAnswers)),
          catchError(error => {
            console.error('Error in deletion process:', error);
            return of(error);
          })
        );
      })
    );
  });




  constructor(
    private actions$: Actions,
    private store: Store,
    private fileUploadService: FileUploadService,
    private equipmentService: EquipmentService,
    private outputUnitService: OutputUnitService,
    private meterFacade: MeterFacade
  ) {}
}
