import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { RemoteData, isInProgress } from 'ngx-remotedata';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, combineLatest, takeWhile } from 'rxjs';
import { SchemeHistoryActions } from './scheme-history.actions';
import { SchemeHistoryState } from './scheme-history.reducer';
import { SchemeHistorySelectors } from './scheme-history.selectors';
import { ReplySubmissionHistory } from 'src/app/api-services/chpqa-api/generated';

/**
 * Facade for dashboard observables and actions.
 */
interface SchemeHistoryStateFacade {
  /** Observables for dashboard state */
  readonly stateObservables: {
    /** Emits the dashboard data wrapped in RemoteData */
    readonly response$: Observable<RemoteData<ReplySubmissionHistory[], HttpErrorResponse>>;
  };

  /** Dispatch actions for the dashboard */
  readonly dispatchActions: {
    /** Dispatches an action to load dashboard data */
    loadSchemeHistoryData: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SchemeHistoryFacade {
  public schemeHistoryFacade: Readonly<SchemeHistoryStateFacade> = {
    stateObservables: {
      response$: this.store.select(SchemeHistorySelectors.selectSchemeHistoryResponse),
    },
    dispatchActions: {
      loadSchemeHistoryData: () => this.store.dispatch(SchemeHistoryActions.loadSchemeHistoryData()),
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
    private store: Store<SchemeHistoryState>,
    private spinner: NgxSpinnerService
  ) {}
}
