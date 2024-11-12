import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { CompanyHouseService } from "@shared/services";
import { Observable, map, of, switchMap } from "rxjs";
import { selectUser } from "src/app/auth/auth.selector";
import { AppState } from "src/app/store/app.reducer";
import { SchemeRegistartiondPath } from "src/app/tasks/scheme-registration/models/scheme-registration-path.model";

@Injectable({
  providedIn: 'root',
})
export class SicOrEconomicSectorGuard implements CanActivate {
  constructor(
    private companyHouseService: CompanyHouseService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const selectSicCodeUrl =
      `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.SELECT_SIC_CODE}`;
    const selectEconomicSectorUrl =
      `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.SELECT_ECONOMIC_SECTOR}`;

    const registrationNumber$ = this.store.select(selectUser).pipe(
      map(user => user.organisation?.registrationNumber)
    );
    
    return registrationNumber$.pipe(
      switchMap(registrationNumber => {
        return registrationNumber
          ? this.companyHouseService.fetchInfoWithSicDescription(registrationNumber)
          : of(null);
      }),
      map(companyHouseInfo => companyHouseInfo?.sic_codes),
      switchMap(companySicCodes => {
        const hasSicCodes = companySicCodes && companySicCodes.length > 0;

        if (hasSicCodes) {
          return state.url === selectSicCodeUrl
            ? of(true)
            : of(this.router.parseUrl(selectSicCodeUrl));
        } else {
          return state.url === selectEconomicSectorUrl
            ? of(true)
            : of(this.router.parseUrl(selectEconomicSectorUrl));
        }
      })
    );
  }
}
