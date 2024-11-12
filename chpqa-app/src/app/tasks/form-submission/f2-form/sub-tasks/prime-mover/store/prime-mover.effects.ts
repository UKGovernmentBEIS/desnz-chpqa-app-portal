import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, forkJoin, map, of, switchMap, take, tap, withLatestFrom } from 'rxjs';
import * as PrimeMoverActions from './prime-mover.actions';
import * as SharedActions from '@shared/store/shared.action';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { Store, select } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { EquipmentService } from '../../../services/equipment.service';
import {
  selectPrimeMover,
  selectPrimeMoverCustomUnit,
  selectPrimeMoverDeletionInformation,
  selectPrimeMoverEngineManufacturerOther,
  selectPrimeMoverEngineModelOther,
  selectPrimeMoverEngineOther,
} from './prime-mover.selectors';
import { UnitService } from '@shared/services/unit.service';
import { EngineUnitMetrics } from '@shared/models/form-submission.model';
import { FileUploadService, PayloadConstantValues } from '../../../services/file-upload.service';
import { isComplex, selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { PrimeMoverFacade } from './prime-mover.facade';
import { downloadFile } from '@shared/shared.util';
import { RequestCreateManufactModelEngineUnit } from 'src/app/api-services/chpqa-api/generated';

@Injectable()
export class PrimeMoverEffects {
  setPrimeMoverDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverDetails),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_TYPE}`,
        })
      )
    );
  });

  setPrimeMoverMechanicalLoad$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverMechanicalLoad),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_MANUFACTURER}`,
        })
      )
    );
  });

  setPrimeMoverType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverType),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectFormSubmissionType))),
      switchMap(([action, submissionId, submissionType]) => {
        const { engineType } = action;
        return this.equipmentService.fetchSubtypesFor(engineType.id, submissionType).pipe(
          switchMap(subtypes => {
            if (subtypes.length === 0) {
              return of(
                SharedActions.navigateTo({
                  url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_MECHANICAL_LOAD}`,
                })
              );
            } else {
              this.equipmentService.setSubTypes(subtypes);
              return of(
                SharedActions.navigateTo({
                  url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_SUBTYPE}`,
                })
              );
            }
          })
        );
      })
    );
  });

  setPrimeMoverSubtype$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverSubtype),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_MECHANICAL_LOAD}`,
        })
      )
    );
  });

  setPrimeMoverEngineManufacturer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverEngineManufacturer),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_MODEL}`,
        })
      )
    );
  });

  setPrimeMoverEngineModel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverEngineModel),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE}`,
        })
      )
    );
  });

  setPrimeMoverEngineName$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverEngineName),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectPrimeMoverCustomUnit))),
      map(([action, submissionId, customUnit]) => {
        if (customUnit) {
          return SharedActions.navigateTo({
            url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_FIGURES}`,
          });
        }
        return SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_DOCUMENTATION}`,
        });
      })
    );
  });

  getEngineUnitById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.getEngineUnitById),
      switchMap(action =>
        this.unitService.getUnitById(action.id).pipe(
          map(unit => {
            if (unit) {
              const engine: EngineUnitMetrics = {
                totalHeatOutputKw: unit.totalHeatCapacityKw,
                totalPowerCapacityKw: unit.totalPowerCapacityKw,
                fuelInputKw: unit.fuelInputKw,
                powerEfficiency: unit.powerEfficiency,
                maxHeatToPowerRatio: unit.maxHeatToPowerRatio,
                maxHeatEfficiency: unit.maxHeatEfficiency,
                maxOverallEfficiency: unit.maxOverallEfficiency,
              };

              return PrimeMoverActions.setPrimeMoverEngineMetrics({ engine });
            } else {
              return PrimeMoverActions.getEngineUnitByIdFail();
            }
          })
        )
      )
    );
  });

  submitNewCustomInit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.submitNewCustomInit),
      withLatestFrom(
        this.store.select(selectSubmissionFormId),
        this.store.select(selectPrimeMoverEngineManufacturerOther),
        this.store.select(selectPrimeMoverEngineModelOther),
        this.store.select(selectPrimeMoverEngineOther)
      ),
      map(([action, idSubmission, manufacturerOther, modelOther, engineUnitOther]) => {
        const request: RequestCreateManufactModelEngineUnit = {
          idSubmission,
          manufacturerOther,
          modelOther,
          engineUnitOther,
          totalPowerCapacityKw: action.engine.totalPowerCapacityKw,
          totalHeatCapacityKw: action.engine.totalHeatOutputKw,
          fuelInputKw: action.engine.fuelInputKw,
          powerEfficiency: action.engine.powerEfficiency,
          maxHeatToPowerRatio: action.engine.maxHeatToPowerRatio,
          maxHeatEfficiency: action.engine.maxHeatEfficiency,
          maxOverallEfficiency: action.engine.maxOverallEfficiency,
        };

        return SharedActions.createUnit({ createUnitRequest: request });
      })
    );
  });

  onCreateUnitSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SharedActions.createUnitSuccess),
      map(action => PrimeMoverActions.setCustomUnitId({ customUnitId: action.createUnitResponse }))
    );
  });

  setCustomUnitId$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setCustomUnitId),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_DOCUMENTATION}`,
        })
      )
    );
  });

  setPrimeMoverDocumentation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.setPrimeMoverDocumentation),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectPrimeMover)), this.store.pipe(select(isComplex)), this.primeMoverFacade.primeMovers$),
      tap(([action, submissionId, primeMover, isComplex, primeMovers]) => {
        if (primeMover.state === null) {
          this.primeMoverFacade.addPrimeMover(primeMover);
        } else {
          this.primeMoverFacade.updatePrimeMover(primeMover);
        }
      }),
      map(([action, submissionId]) =>
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_REVIEW_ANSWERS}`,
        })
      )
    );
  });

  downloadPrimeMoverFile$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrimeMoverActions.downloadPrimeMoverFile),
        withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
        switchMap(([action, submissionId]) =>
          this.primeMoverFacade.downloadFilePrimeMover(submissionId, action.id).pipe(
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

  addAnotherPrimeMover$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.addAnotherPrimeMover),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      switchMap(([action, submissionId]) => [
        PrimeMoverActions.resetPrimeMoverState(),
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.ADD_PRIME_MOVER}`,
        }),
      ])
    );
  });

  submitPrimeMovers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.submitPrimeMovers),
      withLatestFrom(this.primeMoverFacade.isSubmittingPrimeMovers$),
      filter(([_, isSubmitting]) => !isSubmitting),
      switchMap(() =>
        this.primeMoverFacade.submitPrimeMovers$().pipe(
          take(1),
          switchMap(response => {
            return [PrimeMoverActions.submitPrimeMoversSuccess({ successIds: response })];
          }),
          catchError(error => of(PrimeMoverActions.submitPrimeMoversFailure({ error })))
        )
      )
    );
  });

  submitPrimeMoversSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.submitPrimeMoversSuccess),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.primeMoverFacade.primeMovers$),
      switchMap(([action, submissionId, primeMovers]) => {
        const navigateToTaskList = [
          PrimeMoverActions.resetSubmittingPrimeMoverState(),
          SharedActions.navigateTo({
            url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`,
          }),
        ];
        const primeMoverProcesses = action.successIds.map(item => {
          const primeMoverIndex = parseInt(item.name.match(/\d+/)?.[0] || '0', 10) - 1;

          const primeMoverFiles = {
            files: primeMovers[primeMoverIndex]?.files.filter(fileWithId => !fileWithId.id) || [],
            comments: primeMovers[primeMoverIndex]?.comments,
            deletedFileIds: primeMovers[primeMoverIndex]?.deletedFileIds,
          };

          const uploadObservable = primeMoverFiles.files.length > 0 ? this.fileUploadService.equipmentFileUpload(primeMoverFiles, item.id, submissionId) : of(null);
          const deleteObservable =
            primeMoverFiles.deletedFileIds && primeMoverFiles.deletedFileIds.length > 0
              ? this.fileUploadService.deleteFiles(PayloadConstantValues.EquipmentParentEntityProperty, primeMoverFiles.deletedFileIds, submissionId)
              : of(null);
          return forkJoin([uploadObservable, deleteObservable]).pipe(catchError(error => of(error)));
        });

        const filteredPrimeMoverProcesses = primeMoverProcesses.filter(process => process !== null);

        if (filteredPrimeMoverProcesses.length === 0) {
          return of(...navigateToTaskList);
        }

        return forkJoin(filteredPrimeMoverProcesses).pipe(
          map(() => navigateToTaskList),
          switchMap(actions => of(...actions)),
          catchError(error => {
            this.primeMoverFacade.setSubmittingPrimeMoversSubject(false);
            return of(error);
          })
        );
      })
    );
  });

  resetSubmittingPrimeMoverState$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(PrimeMoverActions.resetSubmittingPrimeMoverState),
        tap(() => {
          this.primeMoverFacade.resetSubmittingPrimeMoversState();
        })
      );
    },
    { dispatch: false }
  );

  deletePrimeMover$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.deletePrimeMover),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId))),
      switchMap(([action, submissionId]) => [
        SharedActions.navigateTo({
          url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_CONFIRM_DELETION}`,
        }),
      ])
    );
  });

  confirmDeletePrimeMover$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrimeMoverActions.confirmDeletePrimeMover),
      withLatestFrom(this.store.pipe(select(selectSubmissionFormId)), this.store.pipe(select(selectPrimeMoverDeletionInformation))),
      switchMap(([action, submissionId, primeMoverDeletionInformation]) => {
        const actions = [];
        if (action.confirmDelete.value) {
          const deletePrimeMoverObservable = this.primeMoverFacade
            .deletePrimeMover(submissionId, primeMoverDeletionInformation.index, primeMoverDeletionInformation.id)
            .pipe(
              tap(() => this.primeMoverFacade.showDeleteSuccessBanner()),
              catchError(error => of(error))
            );

          actions.push(deletePrimeMoverObservable);
        }

        const navigateToReviewAnswers = [
          SharedActions.navigateTo({
            url: `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.PRIME_MOVER_REVIEW_ANSWERS}`,
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
    private equipmentService: EquipmentService,
    private unitService: UnitService,
    private fileUploadService: FileUploadService,
    private primeMoverFacade: PrimeMoverFacade
  ) {}
}
