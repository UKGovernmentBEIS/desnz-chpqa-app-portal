import { Component } from '@angular/core';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { RouterModule } from '@angular/router';
import { AddressSearchComponent } from '@shared/components/address-search/address-search.component';
import { Store } from '@ngrx/store';
import {
  setSearchSiteAddressCriteria,
  selectSiteSearchCriteria,
  selectEconomicSubSector,
} from '../../store';
import { FormBuilder } from '@angular/forms';
import { SearchAddressCriteria } from '@shared/models';
import { combineLatest, map } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { EconomicSubSector } from 'src/app/api-services/chpqa-api/generated';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-search-site-address',
  standalone: true,
  imports: [RouterModule, AddressSearchComponent, AsyncPipe, NgIf],
  templateUrl: './search-site-address.component.html',
})
export class SearchSiteAddressComponent {
  addSiteAddressLink = `../${SchemeRegistartiondPath.ADD_SITE_ADDRESS}`;

  copy = schemeRegistrationCopy;

  private searchCriteria$ = this.store.select(selectSiteSearchCriteria);
  private economicSubSector$ = this.store.select(selectEconomicSubSector);

  vm$ = combineLatest([
    this.searchCriteria$, this.economicSubSector$
  ]).pipe(
    map(([searchCriteria, economicSubSector]) => {
      return {
        searchCriteria,
        backUrl: this.getBackLink(economicSubSector)
      };
    })
  );

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  onSearch(criteriaToSearch: SearchAddressCriteria) {
    this.store.dispatch(
      setSearchSiteAddressCriteria({ criteriaToSearch })
    );
  }

  private getBackLink(storedEconomicSubSector: EconomicSubSector) {
    return storedEconomicSubSector
      ? `../${SchemeRegistartiondPath.SELECT_ECONOMIC_SUB_SECTOR}`
      : `../${SchemeRegistartiondPath.SELECT_SIC_CODE}`;
  }
}
