import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakLoginOptions } from 'keycloak-js';
import { Observable, Observer, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authenticationError: any = null;

  constructor(private readonly keycloakService: KeycloakService) {}

  login(options: KeycloakLoginOptions): Observable<any> {
    const login: Promise<void> = this.keycloakService.login(options);

    return of((observer: Observer<boolean>) => {
      login.then(() => observer.next(true));
      login.catch(() => observer.next(false));
    });
  }

  logout(redirectUri: string): Observable<any> {
    const logout: Promise<void> = this.keycloakService.logout(redirectUri);

    return of((observer: Observer<boolean>) => {
      logout.then(() => observer.next(true));
      logout.catch(() => observer.next(false));
    });
  }

  loadIsLoggedIn() {
    return this.keycloakService.isLoggedIn();
  }
}
