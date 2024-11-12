import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, takeWhile } from 'rxjs';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardActions } from './dashboard.actions';
import { DashboardState } from './dashboard.reducer';
import { DashboardSelectors } from './dashboard.selectors';
import { DashboardScheme } from '../models/dashboard-scheme.model';
import { UserType } from '@shared/enums/user-type.enum';

/**
 * Facade for dashboard observables and actions.
 */
interface DashboardStateFacade {
  /** Observables for dashboard state */
  readonly stateObservables: {
    /** Emits the dashboard data wrapped in RemoteData */
    readonly response$: Observable<RemoteData<DashboardScheme[], HttpErrorResponse>>;
  };

  /** Dispatch actions for the dashboard */
  readonly dispatchActions: {
    /** Dispatches an action to load dashboard data */
    loadDashboardData: (userType: UserType) => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardFacade {
  /**
   * Dashboard facade providing observables for state and dispatching actions.
   */
  public dashboardFacade: Readonly<DashboardStateFacade> = {
    stateObservables: {
      response$: this.store.select(DashboardSelectors.selectDashboardResponse),
    },
    dispatchActions: {
      loadDashboardData: (userType: UserType) => this.store.dispatch(DashboardActions.loadData({ userType })),
    },
  };

  showLoadingSpinnerForApiResponses<T>(observables: Observable<RemoteData<T, HttpErrorResponse>>[], isComponentAlive: boolean): void {
    combineLatest(observables)
      .pipe(takeWhile(() => isComponentAlive))
      .subscribe(responses => {
        if (responses.some(response => isInProgress(response))) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });
  }

  constructor(
    private store: Store<DashboardState>,
    private spinner: NgxSpinnerService
  ) {}
}
