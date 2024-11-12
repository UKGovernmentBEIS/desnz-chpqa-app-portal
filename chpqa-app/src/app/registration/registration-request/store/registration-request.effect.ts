import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as RegistrationRequestActions from './registration-request.actions';
import { RegistrationRequestPath } from '../models/registration-request-path.model';
import { SendEmailVerificationService } from '../services/send-email-verification.service';
import { SendRegistrationEmailRequest } from '../models/registration-request.model';
@Injectable()
export class RegistrationRequestEffects {
  sendRegistrationEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationRequestActions.sendRegistrationEmail),
      mergeMap(action => {
        const sendRegistrationEmailRequest: SendRegistrationEmailRequest = {
          to: action.email,
          subject: 'Combined Heat and Power programme: verify your email',
          body: `Dear user,\n\nYou have requested to create an account with the Combined Heat and Power Programme.\n\nClick the button to verify your email address.`,
        };
        return this.sendEmailVerificationService
          .sendRegistrationEmail(sendRegistrationEmailRequest)
          .pipe(
            map(() => RegistrationRequestActions.sendRegistrationEmailSuccess()),
            catchError(error => of(RegistrationRequestActions.sendRegistrationEmailFailure()))
          );
      })
    );
  });

  sendRegistrationEmailSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(RegistrationRequestActions.sendRegistrationEmailSuccess),
        tap(() => {
          this.router.navigate(
            [
              RegistrationRequestPath.BASE_PATH,
              RegistrationRequestPath.VERIFICATION,
            ],
            {
              skipLocationChange: true,
            }
          );
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private readonly sendEmailVerificationService: SendEmailVerificationService
  ) {}
}
