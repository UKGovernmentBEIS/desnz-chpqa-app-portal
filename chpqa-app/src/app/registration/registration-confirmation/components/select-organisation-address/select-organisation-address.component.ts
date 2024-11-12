import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AddressSelectComponent } from '@shared/components/address-select/address-select.component';
import { Store } from '@ngrx/store';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { Address } from '@shared/models';
import { selectOrganisationAddress, selectSearchAddressCriteria, setOrganisationAddress } from '../../store';
import { AsyncPipe } from '@angular/common';
import { AddressService } from '@shared/services';
import { combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-select-organisation-address',
  standalone: true,
  imports: [RouterModule, AddressSelectComponent, AsyncPipe],
  templateUrl: './select-organisation-address.component.html'
})
export class SelectOrganisationAddressComponent {
  BACK = '../' + RegistrationConfirmationPath.SEARCH_ORGANISATION_ADDRESS;
  addOrganisationAddressLink = '../' + RegistrationConfirmationPath.ADD_ORGANISATION_ADDRESS;

  searchCriteria$ = this.store.select(selectSearchAddressCriteria);
  searchResults$ = this.searchCriteria$.pipe(
    switchMap(criteria => this.addressService.fetchByCriteria(criteria))
  );
  selectedResult$ = this.store.select(selectOrganisationAddress);

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

  onSubmit(address: Address) {
    this.store.dispatch(setOrganisationAddress({ address }));
  }
}
