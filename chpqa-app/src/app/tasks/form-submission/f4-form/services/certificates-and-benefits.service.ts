import { Injectable } from '@angular/core';
import { Status } from '@shared/enums/status.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import {
  RequestUpdSubmCFDCertif,
  RequestUpdSubmROCSCertif,
  RequestUpdSubmSoSCertif,
} from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class CertificatesAndBenefitsService {
  constructor(private chpqaApiService: ChqpaApiServiceWrapper) {}

  submitRequestForSoSCertificate(
    formSubmissionId: string,
    groupId: string,
    requestSoSCertificate: boolean
  ) {
    const payload: RequestUpdSubmSoSCertif = {
      idSubmission: formSubmissionId,
      sosCertificate: requestSoSCertificate,
    };

    return this.chpqaApiService.updSubmSoSCertifService.apiSecureUpdSubmSoSCertifPost(
      payload
    );
  }

  submitRequestForRocCertificate(
    formSubmissionId: string,
    groupId: string,
    requestRocCertificate: boolean
  ) {
    const payload: RequestUpdSubmROCSCertif = {
      idSubmission: formSubmissionId,
      rocsCertificate: requestRocCertificate,
    };

    return this.chpqaApiService.updSubmRocsCertifService.apiSecureUpdSubmROCSCertifPost(
      payload
    );
  }

  submitRequestForCfdCertificate(
    formSubmissionId: string,
    groupId: string,
    requestCfdCertificate: boolean
  ) {
    const payload: RequestUpdSubmCFDCertif = {
      idSubmission: formSubmissionId,
      cfdCertificate: requestCfdCertificate,
    };

    return this.chpqaApiService.updSubmCFDCertifService.apiSecureUpdSubmCFDCertifPost(
      payload
    );
  }
}
