import { Injectable } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { OutputUnit, RequestCreateOutputUnit } from 'src/app/api-services/chpqa-api/generated';

export interface CreateOutputUnitRequest {
  outputUnitOther: string;
}

export interface CreateOutputUnitResponse {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class OutputUnitService {

  constructor(private chqpaApiServiceWrapper: ChqpaApiServiceWrapper) {}

  fetchOutputUnits(): Observable<OutputUnit[]> {
    const cachedOutputUnits = localStorage.getItem('output-units');
    if (cachedOutputUnits) {
      return of(JSON.parse(cachedOutputUnits));
    } else {
      return this.chqpaApiServiceWrapper.getOutputUnitsService.apiGetOutputUnitsGet().pipe(
        tap((outputUnits: OutputUnit[]) => {
          localStorage.setItem('output-units', JSON.stringify(outputUnits));
        })
      );
    }
  }

  clearOutputUnitCache(): void {
    localStorage.removeItem('output-units');
  }

  createOutputUnit(outputUnitOther: CreateOutputUnitRequest): Observable<any> {
    localStorage.removeItem('output-units');
    return this.chqpaApiServiceWrapper.createOutputUnitService.apiSecureCreateOutputUnitPost(outputUnitOther as RequestCreateOutputUnit);
  }
}
