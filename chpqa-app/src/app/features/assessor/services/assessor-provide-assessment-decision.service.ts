import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { ReplyAssessmentDecision, RequestAssessmentDecision } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class AssessorProvideAssessmentDecisionService {
  constructor(private chpqaApiService: ChqpaApiServiceWrapper) {}

  getProvideAssessmentDecision(submissionId: string): Observable<ReplyAssessmentDecision> {
    return this.chpqaApiService.getAssessmentDecision.apiAssessorsGetAssessmentDecisionGet(submissionId);
  }

  submitProvideAssessmentDecision(payload: RequestAssessmentDecision) {
    return this.chpqaApiService.postAssessmentDecision.apiAssessorsUpdateAssessmentDecisionPost(payload);
  }
}
