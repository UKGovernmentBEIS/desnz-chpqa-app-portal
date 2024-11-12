import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakLoginOptions } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly route: ActivatedRoute
  ) {}

  login(options?: KeycloakLoginOptions): Promise<void> {
    let leaf = this.route.snapshot;

    while (leaf.firstChild) {
      leaf = leaf.firstChild;
    }

    return this.keycloakService.login({
      ...options,
      ...(leaf.data?.blockSignInRedirect
        ? { redirectUri: location.origin }
        : null),
    });
  }
}
