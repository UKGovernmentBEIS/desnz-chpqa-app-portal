import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';

type UpdateSubmitStatusPayload = {
  idSubmission: string;
  idGroup: string;
  status: Status;
};

type SubmitPayload = {
  idSubmission: string;
  idGroup: string;
  status: Status;
  userid: string;
  schemename: string;
};

@Injectable({
  providedIn: 'root',
})
export class SubmitToAssessorService {
  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  // updateStatus(
  //   submissionId: string,
  //   groupId: string,
  //   newStatus: Status
  // ) {
  //   const payload: UpdateSubmitStatusPayload = {
  //     idSubmission: submissionId,
  //     idGroup: groupId,
  //     status: newStatus
  //   };

  //   return this.apiService.postData<UpdateSubmitStatusPayload, string>(
  //     'UpdateStatusofAssessor',
  //     payload
  //   );
  // }

  submit(scheme: ReplyScheme, submissionId: string, groupId: string) {
    const payload: SubmitPayload = {
      idSubmission: submissionId,
      idGroup: groupId,
      status: Status.Completed,
      userid: scheme.responsiblePerson.id,
      schemename: scheme.name,
    };

   return this.chqpaApiServiceWrapper.updSubmtoAssessorService.apiSecureUpdSubmtoAssessorPost(payload);
  }
}
