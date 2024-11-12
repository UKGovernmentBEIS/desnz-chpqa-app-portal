import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { GOVUKFrontendService } from '@shared/services/govuk-frontend.service';
import { KeycloakService } from 'keycloak-angular';
import { Observable, of } from 'rxjs';
import { setKeycloakUser } from './auth/auth.actions';
import { AuthService } from './auth/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { selectSelectedScheme } from '@shared/store/shared.selector';
import { getUserRole } from '@shared/store';
import { InactivityService } from '@shared/services/inactivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private govukfrontend: GOVUKFrontendService,
    private keycloakService: KeycloakService,
    private store: Store,
    private authService: AuthService,
    private router: Router,
    public inactivityService: InactivityService

  ) {}
  title = 'chpqa-app';

  isAuthenticated$: Observable<boolean> = of(this.authService.loadIsLoggedIn());
  scheme$ = this.store.select(selectSelectedScheme);
  skipLinkPath: string;

  ngOnInit(): void {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if (e.url === this.skipLinkPath) {
          return;
        }
        if (e.url != '') {
          this.skipLinkPath = e.url + '#main-content';
        }
      }
    });
    this.keycloakService
      .loadUserProfile()
      .then(keycloakUser => {
        if (keycloakUser) {
          this.store.dispatch(setKeycloakUser({ keycloakUser }));
          this.store.dispatch(getUserRole());
          this.inactivityService.initInactivityTimer();
          this.inactivityService.startTokenExpirationCheck();

        }
      })
      .catch(() => {
        // TODOO make guards to navigate to landing page
        console.log('not logged in');
        // this.router.navigate(['/landing']);
      });
  }

  ngAfterViewInit(): void {
    this.govukfrontend.initAll();
  }
}
