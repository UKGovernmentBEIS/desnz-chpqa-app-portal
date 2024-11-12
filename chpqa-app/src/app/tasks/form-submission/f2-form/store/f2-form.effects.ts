import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { Status } from '@shared/enums/status.enum';
import { selectSubmissionFormId } from '@shared/store/shared.selector';
import * as SharedActions from '@shared/store/shared.action';
import { FileUploadService } from '../services/file-upload.service';
import { DiagramType } from '../models/file-upload-details.model';
import { Documentation } from '../models/documentation.model';
import { f2FormFeature } from './f2-form.reducer';
import { CapacityDetailsService } from '../sub-tasks/total-power-capacity-under-maxheat/services/capacity-details.service';
import { ReviewSchemeDetailsService } from '../services/review-scheme-details.service';
import * as F2FormActions from './f2-form.actions';
import { FormSubmissionPath } from '../../model/form-submission-path.model';
import { selectSubmissionGroupId } from '../../store/form-submission.selectors';
@Injectable()
export class F2FormEffects {

  submitEnergyFlow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitEnergyFlow),
      withLatestFrom(
        this.store.select(f2FormFeature.selectEnergyFlow),
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(([action, energyFlow, formSubmissionId, groupId]) => {
        return this.uploadDiagram(
          energyFlow,
          DiagramType.EnergyFlowDiagram,
          formSubmissionId,
          groupId
        );
      })
    );
  });

  submitDailyHeatProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitDailyHeatProfile),
      withLatestFrom(
        this.store.select(f2FormFeature.selectDailyHeatProfile),
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(([action, dailyHeatProfile, formSubmissionId, groupId]) => {
        return this.uploadDiagram(
          dailyHeatProfile,
          DiagramType.DailyHeatProfile,
          formSubmissionId,
          groupId
        );
      })
    );
  });

  submitAnnualHeatProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitAnnualHeatProfile),
      withLatestFrom(
        this.store.select(f2FormFeature.selectAnnualHeatProfile),
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(([action, annualHeatProfile, formSubmissionId, groupId]) => {
        return this.uploadDiagram(
          annualHeatProfile,
          DiagramType.AnnualHeatProfile,
          formSubmissionId,
          groupId
        );
      })
    );
  });

  submitHeatLoadDurationCurve$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitHeatLoadDurationCurve),
      withLatestFrom(
        this.store.select(f2FormFeature.selectHeatLoadDurationCurve),
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(
        ([action, heatLoadDurationCurve, formSubmissionId, groupId]) => {
          return this.uploadDiagram(
            heatLoadDurationCurve,
            DiagramType.HeatLoadDurationCurve,
            formSubmissionId,
            groupId
          );
        }
      )
    );
  });

  submitSchemeLineDiagram$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitSchemeLineDiagram),
      withLatestFrom(
        this.store.select(f2FormFeature.selectSchemeLineDiagram),
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(([action, schemeLineDiagram, formSubmissionId, groupId]) => {
        return this.uploadDiagram(
          schemeLineDiagram,
          DiagramType.SchemeLineDiagram,
          formSubmissionId,
          groupId
        );
      })
    );
  });

  submitTotalPowerCapacityUnderMaxHeat$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitTotalPowerCapacityUnderMaxHeat),
      withLatestFrom(
        this.store.select(f2FormFeature.selectTotalPowerCapacityUnderMaxHeat),
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(
        ([
          action,
          totalPowerCapacityUnderMaxHeat,
          formSubmissionId,
          groupId,
        ]) => {
          return this.capacityDetailsService
            .updateTotalCapacityUnderMaxHeat(
              totalPowerCapacityUnderMaxHeat,
              formSubmissionId,
              groupId
            )
            .pipe(
              map(response => {
                return SharedActions.navigateTo({
                  url: `${FormSubmissionPath.BASE_PATH}/${formSubmissionId}/${FormSubmissionPath.TASK_LIST}`,
                });
              })
            );
        }
      )
    );
  });

  submitSchemeDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(F2FormActions.submitSchemeDetails),
      withLatestFrom(
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId)
      ),
      switchMap(([action, formSubmissionId, groupId]) => {
        return this.reviewSchemeDetailsService
          .create(formSubmissionId, groupId, Status.Completed)
          .pipe(
            map(response => {
              return SharedActions.navigateTo({
                url: `${FormSubmissionPath.BASE_PATH}/${formSubmissionId}/${FormSubmissionPath.TASK_LIST}`,
              });
            })
          );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private fileUploadService: FileUploadService,
    private capacityDetailsService: CapacityDetailsService,
    private store: Store,
    private reviewSchemeDetailsService: ReviewSchemeDetailsService
  ) {}

  private uploadDiagram(
    diagramDetails: Documentation,
    diagramType: DiagramType,
    formSubmissionId: string,
    groupId: string
  ) {
    const filteredFiles = diagramDetails.files.filter(file => file.id === null);
    const filteredDiagramDetails = {
      ...diagramDetails,
      files: filteredFiles
    };
    return this.fileUploadService
      .diagramFileUpload(filteredDiagramDetails, diagramType, formSubmissionId, groupId)
      .pipe(
        map(response => {
          return SharedActions.navigateTo({
            url: `${FormSubmissionPath.BASE_PATH}/${formSubmissionId}/${FormSubmissionPath.TASK_LIST}`,
          });
        })
      );
  }
}
