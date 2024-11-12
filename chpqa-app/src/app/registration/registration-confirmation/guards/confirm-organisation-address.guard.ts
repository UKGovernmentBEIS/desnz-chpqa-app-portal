import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, map } from "rxjs";
import { AppState } from "src/app/store/app.reducer";
import { RegistrationConfirmationPath } from "../models/registration-confirmation-path.model";
import { selectOrganisation } from "../store";

@Injectable({
  providedIn: 'root',
})
export class ConfirmOrgAddressGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const confirmOrgAddressUrl =
      `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.CONFIRM_ORGANISATION_ADDRESS}`;
    const searchOrgAddressUrl =
      `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.SEARCH_ORGANISATION_ADDRESS}`;
    
    return this.store.select(selectOrganisation).pipe(
      map(organisation => {
        const isRegistered = (organisation?.registrationNumber ?? false) as boolean;
        const hasAddress = (organisation?.address1 ?? false) as boolean;
        const showConfirmAddressScreen = isRegistered || hasAddress;

        if (showConfirmAddressScreen) {
          return state.url === confirmOrgAddressUrl
            ? true
            : this.router.parseUrl(confirmOrgAddressUrl);
        } else {
          return this.router.parseUrl(searchOrgAddressUrl);
        }
      })
    );
  }
}
