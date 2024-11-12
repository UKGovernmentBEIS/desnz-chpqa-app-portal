import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { UpdateQIThreshold } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class QualityIndexThresholdService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  create(
    submissionFormId: string,
    groupId: string,
    qualityIndexThreshold: number
  ) {
    const updateQIThreshold: UpdateQIThreshold = {
      idSubmission: submissionFormId,
      qualityIndexThreshold: qualityIndexThreshold,
    };
    return this.chqpaApiServiceWrapper.updSubmQIThresholdService.apiSecureUpdSubmQIThresholdPost(
      updateQIThreshold
    );
  }
}
