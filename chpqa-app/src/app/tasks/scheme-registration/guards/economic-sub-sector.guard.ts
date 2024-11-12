import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, map, switchMap } from "rxjs";
import { AppState } from "src/app/store/app.reducer";
import { EconomicSectorService } from "src/app/tasks/scheme-registration/components/economic-sector/services/economic-sector.service";
import { SchemeRegistartiondPath } from "src/app/tasks/scheme-registration/models/scheme-registration-path.model";
import { selectEconomicSector } from "src/app/tasks/scheme-registration/store";

@Injectable({
  providedIn: 'root',
})
export class EconomicSubSectorGuard implements CanActivate {
  constructor(
    private economicSectorService: EconomicSectorService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const selectEconomicSubSectorUrl =
      `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.SELECT_ECONOMIC_SUB_SECTOR}`;
    const selectSiteAddressUrl =
      `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.SEARCH_SITE_ADDRESS}`;

    return this.store.select(selectEconomicSector).pipe(
      switchMap(economicSector => 
        this.economicSectorService.getSubSectors(economicSector)
      ),
      map(economicSubSectors => {
        if (economicSubSectors && economicSubSectors.length > 0) {
          if (state.url === selectEconomicSubSectorUrl) {
            return true;
          } else {
            return this.router.parseUrl(selectEconomicSubSectorUrl);
          }
        } else {
          return this.router.parseUrl(selectSiteAddressUrl);
        }
      })
    );
  }
}
