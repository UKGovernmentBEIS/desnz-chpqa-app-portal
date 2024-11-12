import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { MeterFacade } from '../../store/meter.facade';
import { MeterCrudService } from '../../services/meter-crud.service';
import { select, Store } from '@ngrx/store';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { NavigationService } from '@shared/services/navigation.service';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

export const metersGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const meterFacade = inject(MeterFacade);
  const meterCrudService = inject(MeterCrudService);
  const store = inject(Store);
  const navigationService = inject(NavigationService);
  const cameFromTaskList = navigationService.getPreviousUrl()?.endsWith(FormSubmissionPath.TASK_LIST) ?? false;
  
  const cameFromReviewComments = navigationService.getPreviousUrl()?.endsWith('review-assessor-comments') ?? false;

  return store.pipe(
    select(selectFormSubmissionType),
    take(1),
    switchMap(formSubmissionType =>
      meterCrudService.meters$.pipe(
        take(1),
        switchMap(() => {
          if (cameFromTaskList || cameFromReviewComments) {
            return meterFacade.fetchMeters(route.params['submissionFormId'], formSubmissionType).pipe(
              map(fetchedMeters => !!fetchedMeters),
              catchError(() => of(false))
            );
          } else {
            return of(true);
          }
        })
      )
    )
  );
};
