import { Organisation, Address } from '@shared/models';
import { SchemeStatus } from '@shared/enums/scheme-status.enum';
import { EconomicSector, EconomicSubSector, SicCode } from 'src/app/api-services/chpqa-api/generated';
import { SubmissionStatus } from '@shared/enums/status.enum';

export interface SchemeRegistration {
  id?: string;
  name: string;
  reference?: string;
  createdon?: string;
  status?: SchemeStatus;
  statusText?: string;
  company?: Organisation;
  responsiblePerson: PersonDetails;
  site: Site;
  econSector?: EconomicSector;
  econSubSector?: EconomicSubSector;
  sicCode?: SicCode;
  latestSubmissionStatus?: SubmissionStatus;
  assessor?:  PersonDetails;
  secondAssessor?:  PersonDetails;
}

export type Site = Address & {
  id?: string;
  name?: string;
  areYouTheSiteContactPerson?: boolean;
  instructions?: string;
  contactPerson?: PersonDetails;
};

export type PersonDetails = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  address1?: string;
  address2?: string;
  town?: string;
  county?: string;
  postcode?: string;
  telephone1?: string;
  telephone2?: string;
  organisation?: Organisation;
};
