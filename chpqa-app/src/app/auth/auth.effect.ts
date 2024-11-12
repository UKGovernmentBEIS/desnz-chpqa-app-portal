import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActionTypes, keycloakLoginFail, setUser } from './auth.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { AuthService } from './services/auth.service';
import { fetchAllUnits } from '@shared/store/shared.action';
import { ChqpaApiServiceWrapper } from '../api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private authService: AuthService
  ) {}

  keycloakLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.KEYCLOAK_LOGIN),
      mergeMap((options: { redirectUri: string }) =>
        this.authService.login(options).pipe(
          map(() => ({ type: AuthActionTypes.KEYCLOAK_LOGIN_SUCCESS })),
          catchError(error => of(keycloakLoginFail(error)))
        )
      )
    )
  );

  keycloakLogout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.KEYCLOAK_LOGOUT),
      mergeMap((options: { redirectUri: string }) =>
        this.authService.logout(options.redirectUri).pipe(
          map(() => ({ type: AuthActionTypes.KEYCLOAK_LOGOUT_SUCCESS })),
          catchError(error => of(logoutFail(error)))
        )
      )
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.AUTH_LOGIN),
      mergeMap((action: { email: string }) => {
        return this.chqpaApiServiceWrapper.getContactByEmailService.apiGetContactByEmailGet().pipe(
          map(user => {
            console.log('USER', user);
            return setUser({ user });
          }),
          catchError(error => EMPTY)
        );
      })
    )
  );

  loadUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.AUTH_LOGIN_SUCCESS),
      map(() => fetchAllUnits())
    )
  );
}

function logoutFail(error: any): any {
  throw new Error(error);
}
