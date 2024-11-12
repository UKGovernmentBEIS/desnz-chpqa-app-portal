import { Injectable } from '@angular/core';
import {
  CompanyHouseInfoWithSicCodeDescriptions,
  CompanyHouseInfoWithSicCodes,
  RegisteredOfficeAddress,
} from '@shared/models/company-house-info.model';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { SicCode } from 'src/app/api-services/chpqa-api/generated';

@Injectable({
  providedIn: 'root',
})
export class CompanyHouseService {
  private registeredOfficeAddress =
    new BehaviorSubject<RegisteredOfficeAddress | null>(null);
  private sicCodes = new BehaviorSubject<SicCode[]>([]);

  private companyInformationService =
    this.chqpaApiService.getCompanyInformationService;
  private sicCodeDescriptionService =
    this.chqpaApiService.getSICCodeDetailsListService;

  constructor(private chqpaApiService: ChqpaApiServiceWrapper) {}

  fetchInfoWithSicDescription(
    companyNumber: string
  ): Observable<CompanyHouseInfoWithSicCodeDescriptions> {
    return this.fetchCompanyInfo(companyNumber).pipe(
      switchMap(companyInfo => {
        const sicCodes = companyInfo.sic_codes;

        return this.fetchSicCodesDescriptions(sicCodes).pipe(
          map(sicCodeDescriptions => {
            let result = {
              ...companyInfo,
              sic_codes: sicCodeDescriptions,
            };
            return result;
          })
        );
      })
    );
  }

  private fetchCompanyInfo(companyNumber: string) {
    return this.companyInformationService
      .apiGetCompanyInformationGet(companyNumber)
      .pipe(
        tap((response: CompanyHouseInfoWithSicCodes) =>
          this.registeredOfficeAddress.next(response.registered_office_address)
        )
      );
  }

  private fetchSicCodesDescriptions(
    sicCodes: string[]
  ): Observable<SicCode[]> {
    if (Array.isArray(sicCodes)) {
      return this.sicCodeDescriptionService
        .apiGetSicCodeDetailsListGet(sicCodes)
        .pipe(
          tap(sicDescriptions => {
            this.sicCodes.next([...sicDescriptions]);
          })
        );
    } else {
      this.sicCodes.next([]);
      return of([]);
    }
  }

  getRegisteredOfficeAddress(): Observable<RegisteredOfficeAddress | null> {
    return this.registeredOfficeAddress.asObservable();
  }

  getSicCodes(): Observable<SicCode[]> {
    return this.sicCodes.asObservable();
  }

  removeSicCodes() {
    this.sicCodes.next([]);
  }
}
