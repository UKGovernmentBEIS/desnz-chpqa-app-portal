import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AppState } from 'src/app/store/app.reducer';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionById, selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';

@Injectable({
  providedIn: 'root',
})
export class CanNavigateToSubmissionGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const sectionId: SubmissionGroupType = route.data['sectionId'];
    const submissionFormId = route.params['submissionFormId'];

    return combineLatest([this.store.select(selectSectionStatus(sectionId)), this.store.select(selectSectionById(sectionId))]).pipe(
      switchMap(([status, section]) => {
        if (!section) {
          // No data for the section; redirect to task list
          const redirectUrl = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/task-list`;
          return of(this.router.parseUrl(redirectUrl));
        }

        // If status Cannot Start or Not Applicable, disable the navigation to sub-section
        if (status === Status.CannotStartYet || status === Status.NotApplicable) {
          return of(false);
        } else if (
          status === null &&
          (
            sectionId === SubmissionGroupType.QualityIndexThreshold ||
            sectionId === SubmissionGroupType.PowerEfficiencyStatus ||
            sectionId === SubmissionGroupType.CfdQualityIndexStatus ||
            sectionId === SubmissionGroupType.QualityIndexStatus ||
            sectionId === SubmissionGroupType.RocQualityIndexStatus
          )
        ) {
          // Check all subsections in categories 0, 1, and 2
          // All these subsections need to be either completed or not applicable for us to be able to enter the link and navigate
          return this.checkAllSubsectionsStatus();
        } else {
          return of(true);
        }
      }),
      catchError(() => {
        // Fallback navigation on error, returning an observable of UrlTree
        const redirectUrl = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/task-list`;
        return of(this.router.parseUrl(redirectUrl));
      })
    );
  }

  private checkAllSubsectionsStatus(): Observable<boolean | UrlTree> {
    return this.store.select(selectSubmissionForm).pipe(
      take(1),
      map(data => {
        const sections = data.sectionStatusList;
        // Filter out the sections that should be checked, based on groupCategory and excluding certain groupTypes
        const filteredSections = sections.filter((section: any) =>
          section.status !== null &&
          [0, 1, 2].includes(section.groupCategory));

        // Check if all filtered sections have status "Completed" or "NotApplicable"
        const allCompletedOrNotApplicable = filteredSections.every(
          (section: any) => section.status === Status.Completed || section.status === Status.NotApplicable
        );

        return allCompletedOrNotApplicable;
      })
    );
  }
}
