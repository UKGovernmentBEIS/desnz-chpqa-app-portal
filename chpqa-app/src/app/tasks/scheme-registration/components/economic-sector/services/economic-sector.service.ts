import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { EconomicSector } from 'src/app/api-services/chpqa-api/generated';

@Injectable({ providedIn: 'root' })
export class EconomicSectorService {
  private economicSectors = new BehaviorSubject<EconomicSector[]>([]);

  constructor(private chpqaApiService: ChqpaApiServiceWrapper) {}

  fetchAll() {
    return this.chpqaApiService.getEconSectAndSubSectService.apiGetEconSectAndSubSectGet().pipe(
      tap(economicSectors => {
        this.economicSectors.next(economicSectors);
      })
    );
  }

  getSubSectors(econSector: EconomicSector) {
    return this.economicSectors.pipe(
      map(economicSectors => {
        const economicSector = economicSectors.find(economicSector => economicSector.id === econSector.id);
        return economicSector?.economicSubSectorList;
      })
    );
  }

  getEconomicSectors() {
    return this.economicSectors.asObservable();
  }
  
}
