import { Injectable } from '@angular/core';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { Observable, of } from 'rxjs';
import { ReplyAuditRec, RequestAuditRec } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class AssessorAuditRecommendationService {
  constructor(private chpqaApiService: ChqpaApiServiceWrapper) {}

  getAuditRecommendation(submissionId: string): Observable<ReplyAuditRec> {
    return this.chpqaApiService.getAuditRecService.apiAssessorsGetAuditRecGet(submissionId);
  }

  submitAuditRecommendation(payload: RequestAuditRec) {
    return this.chpqaApiService.postAuditRecService.apiAssessorsUpdAuditRecPost(payload);
  }
}
