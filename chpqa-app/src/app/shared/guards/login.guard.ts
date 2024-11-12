import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateFn,
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard extends KeycloakAuthGuard {
  constructor(
    protected override router: Router,
    protected override keycloakAngular: KeycloakService
  ) {
    super(router, keycloakAngular);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const isAuthenticated = await this.keycloakAngular.isLoggedIn();
      
      if (isAuthenticated) {
        return true;
      } else {
        await this.router.navigate(['/sign-out']);
        return false;
      }
    } catch (err) {
      console.error('Error during authentication check:', err);
      await this.router.navigate(['/sign-out']);
      return false;
    }
  }
}
