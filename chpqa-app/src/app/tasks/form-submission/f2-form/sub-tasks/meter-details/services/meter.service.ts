import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { RequestDeleteMeter, RequestUpdateSubmissionMeterList } from 'src/app/api-services/chpqa-api/generated';
@Injectable({
  providedIn: 'root',
})
export class MeterService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  submitMeters(requestUpdateSubmissionMeterList: RequestUpdateSubmissionMeterList) {
    return this.chqpaApiServiceWrapper.updateSubmissionMeterListService.apiSecureUpdateSubmissionMeterListPost(requestUpdateSubmissionMeterList);
  }

  fetchMeters(submissionId: string) {
    return this.chqpaApiServiceWrapper.getMeterListBySubmissionIdService.apiSecureGetMeterListBySubmissionIdGet(submissionId);
  }

  downloadMeterFile(submissionId: string, fileId: string) {
    return this.chqpaApiServiceWrapper.downloadEquipMeterFileService.apiSecureDownloadEquipMeterFileGet(submissionId, fileId, 1); // 1 for entityType as backend requested
  }

  deleteMeter(submissionId: string, id: string) {
    const requestDeleteMeter: RequestDeleteMeter = { submissionId: submissionId, meterId: id };
    return this.chqpaApiServiceWrapper.deleteMetertService.apiSecureDeleteMeterDelete(requestDeleteMeter);
  }
}
