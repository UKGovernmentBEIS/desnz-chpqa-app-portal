import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Status } from '@shared/enums/status.enum';
import { selectSubmissionFormId } from '@shared/store';
import * as SharedActions from '@shared/store/shared.action';
import { forkJoin } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Uncertainty, RequestDeleteFile } from 'src/app/api-services/chpqa-api/generated';
import { PayloadConstantValues } from 'src/app/tasks/form-submission/f2-form/services/file-upload.service';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSubmissionGroupId } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ChqpaApiServiceWrapper } from '../../../../../../api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { UncertaintyFactorsActions } from './uncertainty-factors.actions';
import { UncertaintyFactorsSelectors } from './uncertainty-factors.selectors';
@Injectable()
export class UncertaintyFactorsEffects {
  submitUncertaintyFactors$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UncertaintyFactorsActions.submitUncertaintyFactors),
      withLatestFrom(
        this.store.select(selectSubmissionFormId),
        this.store.select(selectSubmissionGroupId),
        this.store.select(UncertaintyFactorsSelectors.selectUncertaintyFactorsValues),
        this.store.select(UncertaintyFactorsSelectors.selectUncertaintyFactorsUploadedDocuments)
      ),
      switchMap(([action, submissionFormId, groupId, uncertaintyFactorsValues, uncertaintyFactorsDocuments]) => {
        const uncertaintyFactorsPayload: Uncertainty = {
          idSubmission: submissionFormId,
          foi: uncertaintyFactorsValues.foi,
          foh: uncertaintyFactorsValues.foh,
          fop: uncertaintyFactorsValues.fop,
          uncertaintyFactorComment: uncertaintyFactorsDocuments.comments,
        };

        const uncertaintyFactorsObs = this.chqpaApiServiceWrapper.updateUncertaintyService.apiSecureUpdateUncertaintyPost(uncertaintyFactorsPayload);

        const filteredFiles = uncertaintyFactorsDocuments.files.filter(file => file.id === null);
        const fileDeleteObservables = (uncertaintyFactorsDocuments.deletedFileIds || []).map(fileId => {
          const payload: RequestDeleteFile = {
            parentEntity: PayloadConstantValues.DiagramParentEntityProperty,
            fileID: fileId,
            idSubmission: submissionFormId
          };
          return this.chqpaApiServiceWrapper.deleteFileService.apiSecureDeleteFileDelete(payload);
        });

        const fileUploadObservables = (filteredFiles || []).map(({ file }) => {
          const diagramToUpload = {
            fileName: file.name,
            mimeType: file.type,
            entity: PayloadConstantValues.DiagramEntityProperty,
            attributeName: PayloadConstantValues.AttributeNameProperty,
            parentEntity: PayloadConstantValues.DiagramParentEntityProperty,
            parentAttributeName: PayloadConstantValues.DiagramParentAttributeNameProperty,
            diagramType: 5,
            entityId: submissionFormId,
            groupStatus: Status.Completed,
            groupId,
            file,
          };

          return this.chqpaApiServiceWrapper.uploadFilesService.apiSecureUploadFilesPost(
            submissionFormId,
            diagramToUpload.entity,
            diagramToUpload.attributeName,
            diagramToUpload.parentEntity,
            diagramToUpload.parentAttributeName,
            diagramToUpload.fileName,
            diagramToUpload.diagramType,
            diagramToUpload.mimeType,
            diagramToUpload.entityId,
            uncertaintyFactorsDocuments.comments,
            diagramToUpload.file
          );
        });

        const allApiCallObservables = [...fileUploadObservables, ...fileDeleteObservables, uncertaintyFactorsObs];
        return forkJoin(allApiCallObservables).pipe(
          map(responses => {
            return SharedActions.navigateTo({
              url: `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`,
            });
          })
        );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private store: Store<any>
  ) {}
}
