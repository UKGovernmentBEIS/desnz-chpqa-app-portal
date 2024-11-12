import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { RequestDeleteEquipment, RequestUpdateSubmissionEquipmentList } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class PrimeMoverService {

  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  submitPrimeMovers(requestUpdateSubmissionEquipmentList: RequestUpdateSubmissionEquipmentList) {
    return this.chqpaApiServiceWrapper.updateSubmissionEquipmentListService.apiSecureUpdateSubmissionEquipmentListPost(requestUpdateSubmissionEquipmentList);
  }

  fetchPrimeMovers(submissionId: string) {
    return this.chqpaApiServiceWrapper.getEquipmentListBySubmissionIdService.apiSecureGetEquipmentListBySubmissionIdGet(submissionId );
  }

  downloadPrimeMoverFile(submissionId: string, fileId: string) {
    return this.chqpaApiServiceWrapper.downloadEquipMeterFileService.apiSecureDownloadEquipMeterFileGet(submissionId, fileId, 0); // 0 for entityType as backend requested
  }

  deletePrimeMover(submissionId: string, id: string) {
    const requestDeleteEquipment: RequestDeleteEquipment = {
      submissionId: submissionId,
      equipmentId: id
    }
    return this.chqpaApiServiceWrapper.deleteEquipmentService.apiSecureDeleteEquipmentDelete(requestDeleteEquipment);

  }
}
