import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { AssessorStatus, Status } from '@shared/enums/status.enum';
import { NavigationService } from '@shared/services/navigation.service';
import { selectIsUserAnAssessor, selectSubmissionFormId } from '@shared/store';
import { Observable, catchError, combineLatest, map, of, switchMap, take } from 'rxjs';
import { AppState } from 'src/app/store/app.reducer';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionById, selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';

function getTaskListRedirectUrl(submissionFormId: string): string {
  return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`;
}

@Injectable({
  providedIn: 'root',
})
export class CanNavigateToSubmissionReviewScreenGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router,
    private navigationService: NavigationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const sectionId: SubmissionGroupType = route.data['sectionId'];
    const submissionFormId = route.params['submissionFormId'];

    const cameFromTaskList = this.navigationService.getPreviousUrl().endsWith(FormSubmissionPath.TASK_LIST);

    // Combine observables for section status and section data
    return combineLatest([
      this.store.select(selectSectionStatus(sectionId)),
      this.store.select(selectSectionById(sectionId)),
      submissionFormId ? of(submissionFormId) : this.store.select(selectSubmissionFormId),
      this.store.select(selectIsUserAnAssessor),
    ]).pipe(
      switchMap(([status, section, submissionFormId, isUserAnAssessor]) => {
        if (!section) {
          // No data for the section; redirect to task list
          return of(this.router.parseUrl(getTaskListRedirectUrl(submissionFormId)));
        }

        if (isUserAnAssessor) {
          if (status === AssessorStatus.CannotStartYet) {
            return of(false);
          }
        } else {
          // If status Cannot Start disable the navigation to sub-section
          if (status === Status.CannotStartYet || status === Status.NotApplicable) {
            return of(false);
          }
        }

        if (
          status === null &&
          (sectionId === SubmissionGroupType.QualityIndexThreshold ||
            sectionId === SubmissionGroupType.PowerEfficiencyStatus ||
            sectionId === SubmissionGroupType.CfdQualityIndexStatus ||
            sectionId === SubmissionGroupType.QualityIndexStatus ||
            sectionId === SubmissionGroupType.RocQualityIndexStatus)
        ) {
          // Check all subsections in categories 0, 1, and 2
          return this.checkAllSubsectionsStatus();
        }

        if (isUserAnAssessor) {
          if (status !== AssessorStatus.CannotStartYet && cameFromTaskList) {
            // Section is completed; navigate to the review screen
            const completedRedirectUrl = this.getReviewScreenUrl(sectionId, submissionFormId);

            // Prevent redirect loop by checking if we're already at the target URL
            if (state.url !== completedRedirectUrl && this.router.url !== completedRedirectUrl) {
              return of(this.router.parseUrl(completedRedirectUrl));
            } else {
              return of(true);
            }
          }
          if (status === AssessorStatus.NeedsChange || AssessorStatus.Rejected) {
            const completedRedirectUrl = this.getReviewScreenUrl(sectionId, submissionFormId);
            if (state.url !== completedRedirectUrl && this.router.url !== completedRedirectUrl) {
              return of(this.router.parseUrl(completedRedirectUrl));
            } else {
              return of(true);
            }
          }
        } else {
          if (status === Status.Completed && cameFromTaskList) {
            // Section is completed; navigate to the review screen
            const completedRedirectUrl = this.getReviewScreenUrl(sectionId, submissionFormId);

            // Prevent redirect loop by checking if we're already at the target URL
            if (state.url !== completedRedirectUrl && this.router.url !== completedRedirectUrl) {
              return of(this.router.parseUrl(completedRedirectUrl));
            } else {
              return of(true);
            }
          }
        }

        // Section has data and is not completed; allow navigation
        return of(true);
      }),
      catchError(() => {
        // Fallback navigation on error, returning an observable of UrlTree
        return of(this.router.parseUrl(getTaskListRedirectUrl(submissionFormId)));
      })
    );
  }

  getReviewScreenUrl(sectionId: SubmissionGroupType, submissionFormId: string): string {
    switch (sectionId) {
      case SubmissionGroupType.ReviewRpAndSiteContact:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.REVIEW_ADDRESS_AND_SITE_CONTACT}`;
      case SubmissionGroupType.ProvideUncertaintyFactors:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_SUMMARY}`;
      case SubmissionGroupType.UploadSchemeLineDiagram:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.SCHEME_LINE_DIAGRAM_SUMMARY}`;
      case SubmissionGroupType.UploadEnergyFlowDiagram:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.ENERGY_FLOW_DIAGRAM_SUMMARY}`;
      case SubmissionGroupType.UploadAnnualHeatProfile:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.ANNUAL_HEAT_PROFILE_SUMMARY}`;
      case SubmissionGroupType.UploadDailyHeatProfile:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.DAILY_HEAT_PROFILE_SUMMARY}`;
      case SubmissionGroupType.AddHeatRejectionFacilityDetails:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.HEAT_REJECTION_FACILITY_SUMMARY}`;
      case SubmissionGroupType.UploadHeatLoadDurationCurve:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.HEAT_LOAD_DURATION_CURVE_SUMMARY}`;
      case SubmissionGroupType.AddPrimeMoverDetails:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PRIME_MOVER_REVIEW_ANSWERS}`;
      case SubmissionGroupType.AddMeterDetails:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.METER_REVIEW_ANSWERS}`;
      case SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS_SUMMARY}`;
      case SubmissionGroupType.ProvideHoursOfOperation:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION_SUMMARY}`;
      case SubmissionGroupType.ProvideEnergyInputs:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_ENERGY_INPUTS}`;
      case SubmissionGroupType.ProvidePowerOutputs:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_POWER_OUTPUTS}`;
      case SubmissionGroupType.ProvideHeatOutputs:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_HEAT_OUTPUTS}`;
      case SubmissionGroupType.ProvideCondensingStreamTurbineDetails:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.CONDESING_STEAM_TURBINE_SUMMARY}`;
      case SubmissionGroupType.SecretaryOfStateExemptionCertificate:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE_SUMMARY}`;
      case SubmissionGroupType.RenewablesObligationCertificate:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.ROC_CERTIFICATE_SUMMARY}`;
      case SubmissionGroupType.ContractsForDifferenceCertificate:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.CFD_CERTIFICATE_SUMMARY}`;
      case SubmissionGroupType.ProvideInformationFinancialBenefits:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.FINANCIAL_BENEFITS_SUMMARY}`;
      case SubmissionGroupType.QualityIndexThreshold:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.QUALITY_INDEX_THRESHOLD_SUMMARY}`;
      case SubmissionGroupType.PowerEfficiencyStatus:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.POWER_EFFICIENCY_THRESHOLD}`;
      case SubmissionGroupType.QualityIndexStatus:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.QUALITY_INDEX_STATUS}`;
      case SubmissionGroupType.RocQualityIndexStatus:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.ROC_QUALITY_INDEX_STATUS}`;
      case SubmissionGroupType.CfdQualityIndexStatus:
        return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.CFD_QUALITY_INDEX_STATUS}`;
      case SubmissionGroupType.ProvideAuditRecommendation:
        return `/assessor/audit-recommendation/confirm-your-answers`;
      default:
        return getTaskListRedirectUrl(submissionFormId); // Fallback path
    }
  }

  private checkAllSubsectionsStatus(): Observable<boolean | UrlTree> {
    return this.store.select(selectSubmissionForm).pipe(
      take(1),
      map(data => {
        const sections = data.sectionStatusList;
        // Filter out the sections that should be checked, based on groupCategory and excluding certain groupTypes
        const filteredSections = sections.filter((section: any) => section.status !== null && [0, 1, 2].includes(section.groupCategory));

        // Check if all filtered sections have status "Completed" or "NotApplicable"
        const allCompletedOrNotApplicable = filteredSections.every(
          (section: any) => section.status === Status.Completed || section.status === Status.NotApplicable
        );

        return allCompletedOrNotApplicable;
      })
    );
  }
}
