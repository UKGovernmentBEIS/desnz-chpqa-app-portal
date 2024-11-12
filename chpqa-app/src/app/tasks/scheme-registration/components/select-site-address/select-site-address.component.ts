import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddressSelectComponent } from '@shared/components/address-select/address-select.component';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { Store } from '@ngrx/store';
import { selectSite, selectSiteSearchCriteria, setSite } from '../../store';
import { AsyncPipe, NgIf } from '@angular/common';
import { combineLatest, map, switchMap } from 'rxjs';
import { AddressService } from '@shared/services';
import { Site } from '../../models/scheme-registration.model';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-select-site-address',
  standalone: true,
  imports: [RouterModule, AddressSelectComponent, AsyncPipe, NgIf],
  templateUrl: './select-site-address.component.html'
})
export class SelectSiteAddressComponent {
  BACK = '../' + SchemeRegistartiondPath.SEARCH_SITE_ADDRESS;
  addSiteAddressLink = '../' + SchemeRegistartiondPath.ADD_SITE_ADDRESS;

  copy = schemeRegistrationCopy;

  searchCriteria$ = this.store.select(selectSiteSearchCriteria);
  searchResults$ = this.searchCriteria$.pipe(
    switchMap(criteria => this.addressService.fetchByCriteria(criteria))
  );
  selectedResult$ = this.store.select(selectSite);

  vm$ = combineLatest([
    this.searchCriteria$,
    this.searchResults$,
    this.selectedResult$,
  ]).pipe(
    map(([searchCriteria, searchResults, selectedResult]) => ({
      searchCriteria,
      searchResults,
      selectedResult,
    }))
  );

  constructor(
    private addressService: AddressService,
    private store: Store
  ) {}

  onSubmit(site: Site) {
    this.store.dispatch(setSite({ site, manuallyInsertedSiteAddress: false }));
  }
}
