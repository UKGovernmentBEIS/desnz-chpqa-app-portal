import { Injectable } from '@angular/core';
import { Address, SearchAddressCriteria } from '@shared/models';
import { map } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  addressInformationService = this.chpqaApiService.getAddressInformationService;

  constructor(private chpqaApiService: ChqpaApiServiceWrapper) { }

  fetchByCriteria(criteria: SearchAddressCriteria) {
    const postCode = criteria?.postcode?.trim();
    const nameOrBuildingNumber = criteria?.nameOrBuildingNumber?.trim();
    
    return this.addressInformationService.apiGetAddressInformationGet(postCode, nameOrBuildingNumber).pipe(
      map(addresses => {
        return addresses.map(address => ({...address} as Address))
      })
    );
  }
  
}
