import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import * as RegistrationConfirmationActions from './registration-confirmation.actions';
import { RegistrationConfirmationPath } from '../models/registration-confirmation-path.model';
import { RegisterUserService } from '../services/register-user.service';
import { Store, select } from '@ngrx/store';
import {
  selectPassword,
  selectRegisteredResponsiblePerson,
  selectEmail,
} from './registration-confirmation.selectors';
import { Organisation, UserRequest } from '@shared/models';
import { of } from 'rxjs';
import { VerifyTokenService } from '../services/verify-token.service';
import { VerifyTokenRequest } from '../models/verify-token.model';
import { CompanyHouseService } from '@shared/services';

@Injectable()
export class RegistrationConfirmationEffects {
  setPassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.setPassword),
      map(action => RegistrationConfirmationActions.navigateToLegalStatement())
    );
  });

  setResponsiblePersonForm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RegistrationConfirmationActions.setResponsiblePerson),
      switchMap(({ responsiblePersonForm }) => {
        if (responsiblePersonForm.isCompanyHouseRegistered.value) {
          return of(
            RegistrationConfirmationActions.fetchCompanyInfo({
              companyRegistrationNumber:
                responsiblePersonForm.companyRegistrationNumber,
            })
          );
        } else {
          const organisation: Organisation = {
            name: responsiblePersonForm.companyName,
            registrationNumber: null,
          };
          return of(
            RegistrationConfirmationActions.fetchCompanyInfoSuccess({
              organisation,
            })
          );
        }
      })
    )
  );
  
  setSearchAddressCriteria$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.setSearchAddressCriteria),
      map(action => RegistrationConfirmationActions.navigateToSelectOrganisationAddress())
    );
  });
  
  setOrganisationAddress$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.setOrganisationAddress),
      map(action => RegistrationConfirmationActions.navigateToConfirmOrganisationAddress())
    );
  });

  fetchCompanyInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RegistrationConfirmationActions.fetchCompanyInfo),
      switchMap(action => {
        const regNumber = action.companyRegistrationNumber;

        return this.companyHouseService
          .fetchInfoWithSicDescription(regNumber)
          .pipe(
            map(response => {
              const organisation: Organisation = {
                name: response.company_name,
                registrationNumber: response.company_number,
                address1: response.registered_office_address.address_line_1,
                address2: response.registered_office_address.address_line_2,
                town: response.registered_office_address.locality,
                county: response.registered_office_address.country,
                postcode: response.registered_office_address.postal_code,
              };
              return RegistrationConfirmationActions.fetchCompanyInfoSuccess({
                organisation,
              });
            }),
            catchError(error => {
              console.error('Error fetching company info:', error);
              return of(
                RegistrationConfirmationActions.fetchCompanyInfoFailure({
                  error,
                })
              );
            })
          );
      })
    )
  );

  fetchCompanyInfoSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RegistrationConfirmationActions.fetchCompanyInfoSuccess),
      map(action =>
        RegistrationConfirmationActions.navigateToConfirmOrganisationAddress()
      )
    )
  );

  submitResponsiblePerson$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RegistrationConfirmationActions.submitResponsiblePerson),
      withLatestFrom(
        this.store.pipe(select(selectRegisteredResponsiblePerson)),
        this.store.pipe(select(selectEmail)),
        this.store.pipe(select(selectPassword))
      ),
      switchMap(([action, responsiblePerson, email, password]) => {
        const userRequest: UserRequest = {
          ...responsiblePerson,
          consultant: responsiblePerson.consultant.value as boolean,
          userType: 1,
          email: email,
          password: password,
          username: email,
        };

        return this.registerUserService
          .registerUser(userRequest)
          .pipe(
            map(response => RegistrationConfirmationActions.navigateToSuccess())
          );
      })
    )
  );

  navigateTo$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(RegistrationConfirmationActions.navigateTo),
        tap(action => {
          this.router.navigate([action.url], { skipLocationChange: true });
        })
      );
    },
    { dispatch: false }
  );

  navigateToSigninDetailsForm$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.navigateToResponsiblePersonForm),
      map(action =>
        RegistrationConfirmationActions.navigateTo({
          url: `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.ENTER_RESPONSIBLE_PERSON}`,
        })
      )
    );
  });

  navigateToConfirmOrganisationAddress$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          RegistrationConfirmationActions.navigateToConfirmOrganisationAddress
        ),
        tap(() => {
          this.router.navigate([
            RegistrationConfirmationPath.BASE_PATH,
            RegistrationConfirmationPath.CONFIRM_ORGANISATION_ADDRESS,
          ]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToSearchOrganisationAddress$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          RegistrationConfirmationActions.navigateToSearchOrganisationAddress
        ),
        tap(() => {
          this.router.navigate([
            RegistrationConfirmationPath.BASE_PATH,
            RegistrationConfirmationPath.SEARCH_ORGANISATION_ADDRESS,
          ]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToSelectOrganisationAddress$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          RegistrationConfirmationActions.navigateToSelectOrganisationAddress
        ),
        tap(() => {
          this.router.navigate([
            RegistrationConfirmationPath.BASE_PATH,
            RegistrationConfirmationPath.SELECT_ORGANISATION_ADDRESS,
          ]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToChoosePasswordForm$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.navigateToChoosePasswordForm),
      map(action =>
        RegistrationConfirmationActions.navigateTo({
          url: `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.CHOOSE_PASSWORD}`,
        })
      )
    );
  });

  navigateToLegalStatement$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(RegistrationConfirmationActions.navigateToLegalStatement),
        tap(() => {
          this.router.navigate([
            RegistrationConfirmationPath.BASE_PATH,
            RegistrationConfirmationPath.LEGAL_STATEMENT,
          ]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToCheckAnswers$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(RegistrationConfirmationActions.navigateToCheckAnswers),
        tap(() => {
          this.router.navigate([
            RegistrationConfirmationPath.BASE_PATH,
            RegistrationConfirmationPath.CHECK_ANSWERS,
          ]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.navigateToSuccess),
      map(action =>
        RegistrationConfirmationActions.navigateTo({
          url: `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.SUCCESS}`,
        })
      )
    );
  });

  tokenVerification$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.tokenVerification),
      switchMap(action => {
        const verifyToken: VerifyTokenRequest = {
          email: action.email,
          token: action.token,
        };
        return this.verifyTokenService.verifyToken(verifyToken).pipe(
          mergeMap(response => [
            RegistrationConfirmationActions.setEmail({ email: action.email }),
            RegistrationConfirmationActions.navigateToResponsiblePersonForm(),
          ]),
          catchError(error =>
            of(
              RegistrationConfirmationActions.tokenVerificationFailure({
                error,
              })
            )
          )
        );
      })
    );
  });

  tokenVerificationSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.tokenVerificationSuccess),
      map(() =>
        RegistrationConfirmationActions.navigateToResponsiblePersonForm()
      )
    );
  });

  setAgreeToTerms$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RegistrationConfirmationActions.setAgreeToTerms),
      map(action => RegistrationConfirmationActions.navigateToCheckAnswers())
    );
  });

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store,
    private registerUserService: RegisterUserService,
    @Inject(VerifyTokenService)
    private readonly verifyTokenService: VerifyTokenService,
    private companyHouseService: CompanyHouseService
  ) {}
}
