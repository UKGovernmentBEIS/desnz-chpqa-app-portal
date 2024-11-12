import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  selectCookiesSettings,
} from '@shared/store/shared.selector';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { saveCookieSettings } from '@shared/store/shared.action';
import { Observable } from 'rxjs';
import { CookiesPopUpComponent } from './cookies-pop-up.component';
import { CommonModule } from '@angular/common';
import { CookieService } from 'src/app/core/api/cookie.service';

@Component({
  standalone: true,
  imports: [CookiesPopUpComponent, CommonModule, RouterModule],
  selector: 'app-cookies-pop-up-container',
  template: `
    <app-cookies-pop-up
      *ngIf="showCookiesBanner"
      [areCookiesAccepted]="(areCookiesAccepted$ | async)"
      (cookiesAcceptedEmitter)="cookiesAccepted($event)"
    ></app-cookies-pop-up>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiesPopUpContainerComponent implements OnInit {
  areCookiesAccepted$: Observable<boolean>;
  showCookiesBanner: boolean;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.areCookiesAccepted$ = this.store.select(selectCookiesSettings);

    //TODO: This is temporary. When production env is setup correctly, fix below appropriately.
    // this.showCookiesBanner = !this.cookieService.isPreferencesCookieSet();
    this.showCookiesBanner = false;
  }

  cookiesAccepted(acceptAnalyticsCookies: boolean) {
    this.store.dispatch(saveCookieSettings({ acceptAnalyticsCookies }));
  }

  get isPreferencesCookieSet() {
    return this.cookieService.isPreferencesCookieSet()

  }
}
