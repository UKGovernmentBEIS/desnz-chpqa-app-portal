import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { loadExisitingSiteContact, selectManuallyInsertedSiteAddress, selectSite } from '../../store';
import { AsyncPipe, NgIf } from '@angular/common';
import { map } from 'rxjs';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-confirm-site-address',
  standalone: true,
  imports: [RouterModule, AsyncPipe, NgIf],
  templateUrl: './confirm-site-address.component.html',
  styleUrl: './confirm-site-address.component.scss',
})
export class ConfirmSiteAddressComponent {
  BACK$ = this.store.select(selectManuallyInsertedSiteAddress).pipe(
    map((manual: boolean) => {
      return manual ? `../` + SchemeRegistartiondPath.ADD_SITE_ADDRESS : `../` + SchemeRegistartiondPath.SELECT_SITE_ADDRESS;
    })
  );

  addDifferentAddressLink = '../' + SchemeRegistartiondPath.SEARCH_SITE_ADDRESS;
  addAddressManuallyLink = '../' + SchemeRegistartiondPath.ADD_SITE_ADDRESS;

  copy = schemeRegistrationCopy;

  site$ = this.store.select(selectSite);

  constructor(private store: Store) {}

  onContinue() {
    this.store.dispatch(loadExisitingSiteContact());
  }
}
