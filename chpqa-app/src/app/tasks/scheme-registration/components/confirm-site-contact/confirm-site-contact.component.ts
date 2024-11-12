import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { Observable } from 'rxjs';
import { PersonDetails } from '../../models/scheme-registration.model';
import { Store } from '@ngrx/store';
import { selectContactPerson, selectSiteContactDetails } from '../../store';
import { selectUser } from 'src/app/auth/auth.selector';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-confirm-site-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-site-contact.component.html',
  styleUrl: './confirm-site-contact.component.scss',
})
export class ConfirmSiteContactComponent {
  sameSiteContact$: Observable<PersonDetails> = this.store.select(selectUser);
  newSiteContact$: Observable<PersonDetails> = this.store.select(selectContactPerson);
  isSiteContactPerson$: Observable<boolean> = this.store.select(selectSiteContactDetails);


  addDifferentSiteContactLink = '../' + SchemeRegistartiondPath.SITE_CONTACT_DETAILS;

  copy = schemeRegistrationCopy;

  constructor(
    private store: Store,
    private router: Router,
    private location: Location
  ) {}

  onContinue() {
    this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.SUMMARY]);
  }

  goBack(): void {
    this.location.back();
  }
}
