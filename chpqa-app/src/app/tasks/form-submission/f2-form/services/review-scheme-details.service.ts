import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { map } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

export interface ReviewSchemeDetailsSubmissionRequest {
  idSubmission: string;
  idGroup: string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewSchemeDetailsService {
  constructor(
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper
  ) {}

  create(idSubmission: string, idGroup: string, status: Status) {
    const reviewSchemeDetailsSubmissionRequest = {
      idSubmission: idSubmission,
      idGroup: idGroup,
      status: status,
    };

    return this.chqpaApiServiceWrapper.updateSubmissionReviewSchemeDetailsService
      .apiSecureUpdateSubmissionReviewSchemeDetailsPost(reviewSchemeDetailsSubmissionRequest)
      .pipe(map(response => response));
  }
}
