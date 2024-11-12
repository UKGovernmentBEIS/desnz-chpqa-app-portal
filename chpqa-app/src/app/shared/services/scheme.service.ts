import { Injectable } from '@angular/core';
import { SchemeStatus } from '@shared/enums/scheme-status.enum';
import { first } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { RequestScheme, RequestSchemeLocationDetails, RequestSiteContact } from 'src/app/api-services/chpqa-api/generated';
import { SchemeRegistrationStoreType } from 'src/app/tasks/scheme-registration/store';

@Injectable({
  providedIn: 'root',
})
export class SchemeService {
  constructor(
    private chqpaApiService: ChqpaApiServiceWrapper
  ) {}

  create(schemeRegistration: SchemeRegistrationStoreType, userOrganisationId: string, siteContactDetails: RequestSiteContact) {
    const requestScheme: RequestScheme = {
      name: schemeRegistration.name,
      status: SchemeStatus.NOT_STARTED,
      company: { id: userOrganisationId },
      responsiblePerson: schemeRegistration.responsiblePerson,
      site: {
        ...schemeRegistration.site,
        contactPerson: siteContactDetails,
      } as RequestSchemeLocationDetails,
      econSector: schemeRegistration.econSector,
      econSubSector: schemeRegistration.econSubSector,
      sicCodeId: schemeRegistration.sicCode?.id,
    };

    return this.chqpaApiService.createSchemeService.apiCreateSchemePost(requestScheme);
  }
  
}
