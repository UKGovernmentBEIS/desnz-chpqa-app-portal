import { Component } from '@angular/core';
import { CookieSettingsComponent } from './cookie-settings.component';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCookiesSettings } from '@shared/store/shared.selector';
import { CommonModule } from '@angular/common';
import { saveCookieSettings } from '@shared/store/shared.action';

@Component({
  selector: 'app-cookie-settings-container',
  standalone: true,
  imports: [CookieSettingsComponent, CommonModule],
  template: `<app-cookie-settings
    [cookieSettings]="cookieSettings$ | async"
    (saveCookieSettings)="saveCookieSettings($event)"></app-cookie-settings>`,
})
export class CookieSettingsContainerComponent {
  cookieSettings$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.cookieSettings$ = this.store.select(selectCookiesSettings);
  }

  saveCookieSettings(payload: { acceptAnalytics: boolean } | null) {
    this.store.dispatch(
      saveCookieSettings({
        acceptAnalyticsCookies: payload.acceptAnalytics,
        navigateTo: '/login',
      })
    );
  }
}
