import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { DashboardActions } from './dashboard.actions';
import { Store } from '@ngrx/store';
import { UserType } from '@shared/enums/user-type.enum';
import { DashboardScheme } from '../models/dashboard-scheme.model';

@Injectable()
export class DashboardEffects {
  constructor(
    private actions$: Actions,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private store: Store
  ) {}

  loadDashboardData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadData),
      mergeMap((action) => {
        let loadDashboardDataApi$ = this.loadDashboardDataByUserType(action?.userType);

        return loadDashboardDataApi$.pipe(
          map(response => {
            return DashboardActions.loadDataSuccess({ payload: response });
          }),
          catchError(error => of(DashboardActions.loadDataFailure({ error })))
        );
      })
    )
  );

  private loadDashboardDataByUserType(userType: UserType) {
    let loadDashboardDataApi$: Observable<DashboardScheme[]>;

    switch (userType) {
      case UserType.ResponsiblePerson:
        loadDashboardDataApi$ =
          this.chqpaApiServiceWrapper.getSchemesByUserIdService.apiGetSchemesByUserIdGet();
        break;
      case UserType.TechnicalAssessor:
        loadDashboardDataApi$ =
          this.chqpaApiServiceWrapper.getSchemesByTAssessorService.apiAssessorsGetSchemesforTAssessorGet();
        break;
      case UserType.OptRP:
        // TODO: To be defined when time comes
        break;
      case UserType.Certifier:
        // TODO: To be defined when time comes
        break;
      case UserType.Auditor:
        // TODO: To be defined when time comes
        break;
      case UserType.DelegateRP:
        // TODO: To be defined when time comes
        break;
      case UserType.TechnicalAssessor2:
        loadDashboardDataApi$ =
          this.chqpaApiServiceWrapper.getSchemesByTAssessorService.apiAssessorsGetSchemesforTAssessorGet();
        break;
      case UserType.AssessorAdmin:
        // TODO: To be defined when time comes
        break;
    }

    return loadDashboardDataApi$;
  }

}
