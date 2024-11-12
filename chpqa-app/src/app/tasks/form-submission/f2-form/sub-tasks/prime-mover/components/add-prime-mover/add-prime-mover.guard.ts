import { inject } from '@angular/core';
import {  ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { PrimeMoverFacade } from '../../store/prime-mover.facade';
import { PrimeMoverCrudService } from '../../services/prime-mover-crud.service';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { NavigationService } from '@shared/services/navigation.service';

export const primeMoversGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const primeMoverFacade = inject(PrimeMoverFacade);
  const primeMoverCrudService = inject(PrimeMoverCrudService);
  const navigationService = inject(NavigationService);
  const cameFromTaskList = navigationService.getPreviousUrl().endsWith(FormSubmissionPath.TASK_LIST)  ?? false;
  const cameFromReviewComments = navigationService.getPreviousUrl()?.endsWith('review-assessor-comments') ?? false;

  return primeMoverCrudService.primeMovers$.pipe(
    take(1),
    switchMap(() => {
      if (cameFromTaskList || cameFromReviewComments) {
        return primeMoverFacade.fetchPrimeMovers(route.params['submissionFormId']).pipe(
          map(fetchedPrimeMovers => !!fetchedPrimeMovers),
          catchError(() => of(false))
        );
      } else {
        return of(true);
      }
    })
  );
};