import { Injectable } from '@angular/core';
import { forkJoin, from, map, switchMap } from 'rxjs';
import { DiagramType } from '../models/file-upload-details.model';
import { Status } from '@shared/enums/status.enum';
import { Documentation } from '../models/documentation.model';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { RequestDeleteFile } from 'src/app/api-services/chpqa-api/generated';

export enum PayloadConstantValues {
  AttributeNameProperty = 'desnz_file',
  DiagramEntityProperty = 'desnz_submissiondiagramsfiles',
  DiagramParentEntityProperty = 'desnz_submission',
  DiagramParentAttributeNameProperty = 'desnz_submission',
  EquipmentEntityProperty = 'desnz_equipmentfiles',
  EquipmentParentEntityProperty = 'desnz_primemovers',
  EquipmentParentAttributeNameProperty = 'desnz_equipment',
  MetersEntityProperty = 'desnz_meterfiles',
  MetersParentEntityProperty = 'desnz_fuelmeters',
  MetersParentAttributeNameProperty = 'desnz_meter',
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private chpqaApiService: ChqpaApiServiceWrapper) {}

  diagramFileUpload(documentation: Documentation, diagramType: DiagramType, submissionId: string, groupId: string) {
    const fileUploadObservables = (documentation.files || []).map(({ file }) => {
      const diagramToUpload = {
        fileName: file.name,
        mimeType: file.type,
        entity: PayloadConstantValues.DiagramEntityProperty,
        attributeName: PayloadConstantValues.AttributeNameProperty,
        parentEntity: PayloadConstantValues.DiagramParentEntityProperty,
        parentAttributeName: PayloadConstantValues.DiagramParentAttributeNameProperty,
        diagramType,
        entityId: submissionId,
        groupStatus: Status.Completed,
        groupId,
        file,
      };

      return this.chpqaApiService.uploadFilesService.apiSecureUploadFilesPost(
        submissionId,
        diagramToUpload.entity,
        diagramToUpload.attributeName,
        diagramToUpload.parentEntity,
        diagramToUpload.parentAttributeName,
        diagramToUpload.fileName,
        diagramToUpload.diagramType,
        diagramToUpload.mimeType,
        diagramToUpload.entityId,
        documentation.comments,
        diagramToUpload.file
      );
    });

    const commentsObservables = this.chpqaApiService.updSubmDiagramCommentService.apiSecureUpdSubmDiagramCommentPost({
      commentValue: documentation.comments,
      submissionId: submissionId,
      diagramType,
    });

    const fileDeleteObservables = (documentation.deletedFileIds || []).map(fileId => {
      const payload: RequestDeleteFile = {
        parentEntity: PayloadConstantValues.DiagramParentEntityProperty,
        fileID: fileId,
        idSubmission: submissionId
      };
      return this.chpqaApiService.deleteFileService.apiSecureDeleteFileDelete(payload);
    });

    const allApiCallObservables = [...fileUploadObservables, ...fileDeleteObservables, commentsObservables];

    return forkJoin(allApiCallObservables).pipe(
      map(responses => {
        return {
          uploadResponses: responses.slice(0, documentation.files.length),
          deleteResponses: responses.slice(documentation.files.length),
          commentsResponse: responses,
        };
      })
    );
  }

  equipmentFileUpload(documentation: Documentation, equipmentId: string, submissionFormId: string) {
    const fileUploadObservables = documentation.files.map(({ file }) =>
      from(this.convertFileToBase64(file)).pipe(
        map(base64String => {
          const diagramToUpload = {
            base64String: this.cleanBase64String(base64String),
            fileName: file.name,
            mimeType: file.type,
            entity: PayloadConstantValues.EquipmentEntityProperty,
            attributeName: PayloadConstantValues.AttributeNameProperty,
            parentEntity: PayloadConstantValues.EquipmentParentEntityProperty,
            parentAttributeName: PayloadConstantValues.EquipmentParentAttributeNameProperty,
            entityId: equipmentId,
            file: file,
          };
          return diagramToUpload;
        }),
        switchMap(diagramToUpload =>
          this.chpqaApiService.uploadFilesService.apiSecureUploadFilesPost(
            submissionFormId,
            diagramToUpload.entity,
            diagramToUpload.attributeName,
            diagramToUpload.parentEntity,
            diagramToUpload.parentAttributeName,
            diagramToUpload.fileName,
            null,
            diagramToUpload.mimeType,
            diagramToUpload.entityId,
            documentation.comments,
            diagramToUpload.file
          )
        )
      )
    );

    const fileDeleteObservables = (documentation.deletedFileIds || []).map(fileId =>
      this.chpqaApiService.deleteFileService.apiSecureDeleteFileDelete({parentEntity: PayloadConstantValues.EquipmentParentEntityProperty, fileID: fileId, idSubmission: submissionFormId})
    );

    const allApiCallObservables = [...fileUploadObservables, ...fileDeleteObservables];

    return forkJoin(allApiCallObservables).pipe(
      map(responses => {
        return {
          uploadResponses: responses.slice(0, documentation.files.length),
          deleteResponses: responses.slice(documentation.files.length),
        };
      })
    );
  }

  metersFileUpload(documentation: Documentation, meterId: string, submissionFormId: string) {
    const fileObservables = documentation.files.map(({ file }) =>
      from(this.convertFileToBase64(file)).pipe(
        map(base64String => {
          const diagramToUpload = {
            base64String: this.cleanBase64String(base64String),
            fileName: file.name,
            mimeType: file.type,
            entity: PayloadConstantValues.MetersEntityProperty,
            attributeName: PayloadConstantValues.AttributeNameProperty,
            parentEntity: PayloadConstantValues.MetersParentEntityProperty,
            parentAttributeName: PayloadConstantValues.MetersParentAttributeNameProperty,
            comments: documentation.comments,
            entityId: meterId,
            file: file,
          };

          return diagramToUpload;
        })
      )
    );
    return forkJoin(fileObservables).pipe(
      switchMap(diagramFilesToUpload => {
        const apiCallObservables = diagramFilesToUpload.map(diagramToUpload =>
          this.chpqaApiService.uploadFilesService.apiSecureUploadFilesPost(
            submissionFormId,
            diagramToUpload.entity,
            diagramToUpload.attributeName,
            diagramToUpload.parentEntity,
            diagramToUpload.parentAttributeName,
            diagramToUpload.fileName,
            null,
            diagramToUpload.mimeType,
            diagramToUpload.entityId,
            documentation.comments,
            diagramToUpload.file
          )
        );

        return forkJoin(apiCallObservables);
      }),
      map(responses => responses)
    );
  }

  deleteFiles(parentEntity: PayloadConstantValues.EquipmentParentEntityProperty | PayloadConstantValues.MetersParentEntityProperty, deletedFileIds: string[], submissionId: string) {
    const fileDeleteObservables = deletedFileIds.map(fileId => this.chpqaApiService.deleteFileService.apiSecureDeleteFileDelete({parentEntity, fileID: fileId, idSubmission: submissionId}));
    return forkJoin(fileDeleteObservables);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private cleanBase64String(base64String: string) {
    const splittedString = base64String.split(',');
    return splittedString[1];
  }
}
