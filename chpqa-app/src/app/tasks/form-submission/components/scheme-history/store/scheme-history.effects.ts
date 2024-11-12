import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { SchemeHistoryActions } from './scheme-history.actions';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';

@Injectable()
export class SchemeHistoryEffects {
  constructor(private actions$: Actions,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,) {}

  loadSchemeHistoryData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SchemeHistoryActions.loadSchemeHistoryData),
      mergeMap(() => {
        const mockSchemeId = '48f455f1-029b-ef11-8a6a-000d3ab3a33b';
        return this.chqpaApiServiceWrapper.schemeHistoryService.apiAssessorsGetSchemeHistoryGet(mockSchemeId).pipe(
          map(response => {
            return SchemeHistoryActions.loadSchemeHistoryDataSuccess({payload: response})
          }),
          catchError(error => of(SchemeHistoryActions.loadSchemeHistoryDataFailure({ error })))
        )
      })
    )
  );
}
