import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { mergeMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private excludedUrls: string[] = [
    'CheckIfUserExists',
    'GetAddressInformation',
    'GetCompanyInformation',
    'GetSicCodeDetailsList',
    'RegisterUser',
    'SendRegEmail',
    'VerifyToken',
  ];

  constructor(private keycloakService: KeycloakService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isUrlExcluded(req.url)) {
      return next.handle(req);
    }

    return from(this.addToken(req)).pipe(
      mergeMap(reqWithToken => next.handle(reqWithToken)),
      catchError((error: Error) => {
        const isAnauthorized = this.isUnauthorizedError(error?.cause as number);
        if (isAnauthorized) {
          this.handleAuthError();
        }

        return throwError(() => new Error(error?.message || 'Authentication Error'));
      })
    );
  }

  private isUnauthorizedError(statusCode: number) {
    return statusCode && (statusCode === 401 || statusCode === 403);
  }

  private async addToken(req: HttpRequest<any>): Promise<HttpRequest<any>> {
    try {
      const isTokenExpired = this.keycloakService.isTokenExpired();

      if (isTokenExpired) {
        const updated = await this.keycloakService.updateToken(10);
        if (!updated) {
          this.handleAuthError();
        }
      }

      const token = await this.keycloakService.getToken();
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      this.handleAuthError();
      throw error;
    }
  }

  private isUrlExcluded(url: string): boolean {
    return this.excludedUrls.some(excludedUrl => url.includes(excludedUrl));
  }

  private handleAuthError(): void {
    this.router.navigate(['/sign-out']);
  }
}
