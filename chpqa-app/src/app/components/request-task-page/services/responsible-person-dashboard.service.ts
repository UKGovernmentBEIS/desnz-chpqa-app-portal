import { Injectable } from '@angular/core';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';

@Injectable()
export class ResponsiblePersonDashboardService {
  // Extract unique responsible persons
  // TODO: This implementation is mock. This will propably change in the future
  extractResponsiblePersons(schemes: ReplyScheme[]): string[] {
    return [...new Set(schemes
      .filter(scheme => scheme?.responsiblePerson?.firstName && scheme?.responsiblePerson?.lastName)
      .map(scheme => `${scheme.responsiblePerson.firstName} ${scheme.responsiblePerson.lastName}`)
    )];
  }
  
}
