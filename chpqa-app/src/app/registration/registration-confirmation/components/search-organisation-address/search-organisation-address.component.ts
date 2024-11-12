import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddressSearchComponent } from '@shared/components/address-search/address-search.component';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { Store } from '@ngrx/store';
import { selectOrganisation, selectSearchAddressCriteria, setSearchAddressCriteria } from '../../store';
import { combineLatest, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SearchAddressCriteria } from '@shared/models';

@Component({
  selector: 'app-search-organisation-address',
  standalone: true,
  imports: [RouterModule, AddressSearchComponent, AsyncPipe],
  templateUrl: './search-organisation-address.component.html'
})
export class SearchOrganisationAddressComponent {
  addOrganisationAddressLink = '../' + RegistrationConfirmationPath.ADD_ORGANISATION_ADDRESS;

  organisation$ = this.store.select(selectOrganisation);
  searchAddressCriteria$ = this.store.select(selectSearchAddressCriteria);
  vm$ = combineLatest([this.organisation$, this.searchAddressCriteria$]).pipe(
    map(([organisation, searchAddressCriteria]) => {
      const isRegistered = (organisation?.registrationNumber ?? false) as boolean;
      const hasAddress = (organisation?.address1 ?? false) as boolean;
      const showConfirmAddressScreen = isRegistered || hasAddress;

      const backUrl = showConfirmAddressScreen
        ? `../${RegistrationConfirmationPath.CONFIRM_ORGANISATION_ADDRESS}`
        : `../${RegistrationConfirmationPath.ENTER_RESPONSIBLE_PERSON}`;

      return {
        backUrl,
        searchAddressCriteria
      }
    })
  );

  constructor(private store: Store) { }

  onSearch(searchAddressCriteria: SearchAddressCriteria) {
    this.store.dispatch(setSearchAddressCriteria({ searchAddressCriteria }));
  }
}
