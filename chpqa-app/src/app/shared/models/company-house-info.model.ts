import { SicCode } from "src/app/api-services/chpqa-api/generated";

export interface CompanyHouseInfoBase {
  company_number: string;
  date_of_creation: string;
  last_full_members_list_date: string;
  type: string;
  jurisdiction: string;
  company_name: string;
  registered_office_address: RegisteredOfficeAddress;
  accounts: Accounts;
  undeliverable_registered_office_address: boolean;
  has_insolvency_history: boolean;
  company_status: string;
  etag: string;
  has_charges: boolean;
  links: Links;
  registered_office_is_in_dispute: boolean;
  date_of_cessation: string;
  can_file: boolean;
}

export interface CompanyHouseInfoWithSicCodes extends CompanyHouseInfoBase {
  sic_codes: string[];
}

export interface CompanyHouseInfoWithSicCodeDescriptions extends CompanyHouseInfoBase {
  sic_codes: SicCode[];
}

export interface Links {
  self: string;
  filing_history: string;
  officers: string;
  charges: string;
}

export interface Accounts {
  accounting_reference_date: AccountingReferenceDate;
  last_accounts: LastAccounts;
}

export interface LastAccounts {
  made_up_to: string;
  type: string;
  period_end_on: string;
}

export interface AccountingReferenceDate {
  month: string;
  day: string;
}

export interface RegisteredOfficeAddress {
  postal_code: string;
  address_line_2: string;
  country: string;
  address_line_1: string;
  locality: string;
}
