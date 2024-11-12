import { Component } from '@angular/core';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { Store } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { selectContactPerson, setSiteContactDetails } from '../../store';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-confirm-existing-site-contact',
  standalone: true,
  imports: [RouterModule, AsyncPipe, NgIf],
  templateUrl: './confirm-existing-site-contact.component.html',
  styleUrl: './confirm-existing-site-contact.component.scss',
})
export class ConfirmExistingSiteContactComponent {
  BACK = `../` + SchemeRegistartiondPath.CONFIRM_SITE_ADDRESS;
  existingSiteContact$ = this.store.select(selectContactPerson);

  addDifferentSiteContactLink = '../' + SchemeRegistartiondPath.SITE_CONTACT_DETAILS;

  copy = schemeRegistrationCopy;

  constructor(
    private store: Store,
    private router: Router
  ) {}

  onContinue() {
    this.store.dispatch(
      setSiteContactDetails({
        areYouTheSiteContactPerson: false,
      })
    );
    this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.SUMMARY]);
  }
}
