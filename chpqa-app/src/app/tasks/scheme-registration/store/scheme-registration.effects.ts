import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as SharedActions from '@shared/store/shared.action';
import {
  setSearchSiteAddressCriteria,
  setSchemeName,
  setSite,
  setNewSiteContact,
  submitScheme,
  submitSchemeSuccess,
  submitSchemeFailure,
  resetScheme,
  setSicCode,
  setEconomicSector,
  setEconomicSubSector,
  loadExisitingSiteContact,
  loadExisitingSiteContactSuccess,
  loadExisitingSiteContactFailure,
} from './scheme-registration.actions';
import { SchemeRegistartiondPath } from '../models/scheme-registration-path.model';
import { Store } from '@ngrx/store';
import { selectContactPerson, selectScheme, selectSite, selectSiteContactDetails } from './scheme-registration.selectors';
import { selectUser } from 'src/app/auth/auth.selector';
import { of } from 'rxjs/internal/observable/of';
import { SchemeService } from '@shared/services/scheme.service';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable()
export class SchemeRegistrationEffects {
  navigateToSelectSicCodeOrEconomicSector$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setSchemeName),
        tap(() => {
          //The guard related to the below route will decide whether
          //to display the sic code or the econ sector flow
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.SELECT_SIC_CODE]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToSelectEconomicSubSector$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setEconomicSector),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.SELECT_ECONOMIC_SUB_SECTOR]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToSearchSiteAddress$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setSicCode, setEconomicSubSector),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.SEARCH_SITE_ADDRESS]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToSearchSiteAddressResults$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setSearchSiteAddressCriteria),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.SELECT_SITE_ADDRESS]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToConfirmSiteAddress$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setSite),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.CONFIRM_SITE_ADDRESS]);
        })
      );
    },
    { dispatch: false }
  );

  navigateToConfirmSiteContact$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(setNewSiteContact),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.CONFIRM_SITE_CONTACT]);
        })
      );
    },
    { dispatch: false }
  );

  submitScheme$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(submitScheme),
      withLatestFrom(
        this.store.select(selectSiteContactDetails),
        this.store.select(selectContactPerson),
        this.store.select(selectUser),
        this.store.select(selectScheme)
      ),
      switchMap(([action, areYouTheSiteContactPerson, contactPerson, user, schemeState]) => {
        let siteContactDetails;
        if (areYouTheSiteContactPerson) {
          siteContactDetails = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.jobTitle,
            telephone1: user.telephone1,
          };
        } else {
          siteContactDetails = contactPerson;
        }

        return this.schemeService.create(schemeState, user.organisation.id, siteContactDetails).pipe(
          map(response => submitSchemeSuccess()),
          catchError(error => of(submitSchemeFailure({ error })))
        );
      })
    );
  });

  submitSchemeSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(submitSchemeSuccess),
      switchMap(() => [
        SharedActions.navigateTo({
          url: `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.CONFIRMATION}`,
        }),
        resetScheme(),
      ])
    );
  });

  loadExisitingSiteContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExisitingSiteContact),
      mergeMap(() =>
        this.store.select(selectSite).pipe(
          take(1),
          switchMap(site => {
            return this.chqpaApiServiceWrapper.getSiteLocationByAddressService
              .apiGetSiteLocationByAddressGet(site.address1, site.postcode, site.town, undefined, site.county)
              .pipe(
                map(response => {
                  return loadExisitingSiteContactSuccess({ id: response.id, contactPerson: response.contactPerson });
                }),
                catchError(error => of(loadExisitingSiteContactFailure({ error })))
              );
          })
        )
      )
    )
  );

  navigateAfterLoadSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadExisitingSiteContactSuccess),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.EXISTING_SITE_CONTACT_DETAILS]);
        })
      ),
    { dispatch: false }
  );

  loadExisitingSiteContactFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadExisitingSiteContactFailure),
        tap(() => {
          this.router.navigate([SchemeRegistartiondPath.BASE_PATH, SchemeRegistartiondPath.NEW_SITE_CONTACT_DETAILS]);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store,
    private schemeService: SchemeService,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper
  ) {}
}
