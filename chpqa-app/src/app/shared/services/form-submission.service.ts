import { Injectable } from '@angular/core';
import { FormSubmission } from '@shared/models/form-submission.model';
import { Observable, map } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { ReplyScheme, ReplySubmission, RequestReturnId } from 'src/app/api-services/chpqa-api/generated';

@Injectable({ providedIn: 'root' })
export class FormSubmissionService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  create(submission: FormSubmission): Observable<RequestReturnId> {
    return this.chqpaApiServiceWrapper.createSubmissionService.apiCreateSubmissionPost(submission).pipe(map(response => response));
  }

  getLatestBySchemeId(schemeId: string): Observable<ReplySubmission> {
    return this.chqpaApiServiceWrapper.getSubmissionBySchemeidService.apiGetSubmissionBySchemeidGet(schemeId);
  }

  getSubmissionForm(Id: string): Observable<ReplySubmission> {
    const params = { Id };
    return this.chqpaApiServiceWrapper.getSubmissionByidService.apiGetSubmissionByidGet(Id);
  }

  getScheme(Id: string): Observable<ReplyScheme> {
    const params = { Id };
    return this.chqpaApiServiceWrapper.getSchemeByIdService.apiGetSchemeByIdGet(Id);
  }
}
