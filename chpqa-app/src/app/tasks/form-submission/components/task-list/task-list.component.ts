import { CommonModule, KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { SubmissionFormType, SubmissionGroupCategory, SubmissionGroupType, SubmissionGroupTypeRoutes } from '@shared/enums/form-submission.enum';
import { AssessorStatus, Status, SubmissionStatus } from '@shared/enums/status.enum';
import { TextLinkItem } from '@shared/interfaces/text-link-item.interface';
import { FormSubmission, SubmissionSectionStatusDetailed } from '@shared/models/form-submission.model';
import { DisplaySchemeNamePipe } from '@shared/pipes/scheme-name.pipe';
import { FormSubmissionService } from '@shared/services/form-submission.service';
import {
  resetAllForms,
  resetToInitialState,
  selectIsSubmissionNonEditable,
  selectIsUserAnAssessor,
  selectSelectedScheme,
  selectSubmissionFormId,
  setScheme,
  SharedFacade,
} from '@shared/store';
import { Observable, catchError, combineLatest, filter, map, of, shareReplay, switchMap, take, takeWhile, tap, withLatestFrom } from 'rxjs';
import { ReplySchemeForAssessor, ReplySubmissionGroups } from 'src/app/api-services/chpqa-api/generated';
import { RelatedActionsComponent } from '../../../../shared/components/related-actions/related-actions.component';
import { StatusComponent } from '../../../../shared/components/status/status.component';
import { isF4 } from '../../f4-form/utils/f4-form.utils';
import { FormSubmissionPath } from '../../model/form-submission-path.model';
import { setSubmissionForm, setSubmissionGroup, setSubmitToAssessorGroupId } from '../../store';
import { SubmissionGroupCategoryLabelPipe } from '../../utils/submission-group-category-label.pipe';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { AssessorActions } from 'src/app/features/assessor/store/assessor.actions';
import { selectUser } from 'src/app/auth/auth.selector';
import { UserType } from '@shared/enums/user-type.enum';
import { ASSESSOR_ROUTE_PATHS } from 'src/app/features/assessor/config/assessor-routes.config';
import { AssessorDashboardSelectors, AssessorSelectors } from 'src/app/features/assessor/store/assessor.selectors';
import { isSuccess } from 'ngx-remotedata';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  imports: [RouterLink, CommonModule, RelatedActionsComponent, StatusComponent, SubmissionGroupCategoryLabelPipe, DisplaySchemeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent implements OnInit, OnDestroy {
  BACK = '../../../request-task-page';
  isSubmissionNonEditable$ = this.store.select(selectIsSubmissionNonEditable);

  isUserAnAssessor$ = this.sharedFacade.isUserATechnicalAssessor();
  isUserAnAssessor2$ = this.sharedFacade.isUserATechnicalAssessor2();
  isUserAnAssessorAdmin$ = this.sharedFacade.isUserAnAssessorAdmin();

  submissionForm$ = this.store.pipe(
    select(selectSubmissionFormId),
    take(1),
    switchMap(id =>
      this.formSubmissionService.getSubmissionForm(id).pipe(
        tap(response => {
          this.store.dispatch(setSubmissionForm({ formSubmission: response }));
        })
      )
    ),
    shareReplay(1)
  );

  scheme$ = this.store.pipe(
    select(selectSubmissionFormId),
    take(1),
    switchMap(id =>
      this.formSubmissionService.getSubmissionForm(id).pipe(
        switchMap(res => this.formSubmissionService.getScheme(res.scheme.id)),
        tap(response => {
          this.store.dispatch(setScheme({ scheme: response }));
        })
      )
    ),
    shareReplay(1)
  );

  vm$ = combineLatest([this.submissionForm$, this.scheme$, this.isUserAnAssessor$]).pipe(
    map(([submissionForm, scheme, isUserAnAssessor]) => {
      return {
        submissionForm,
        scheme,
        isUserAnAssessor,
      };
    })
  );

  assignedTo$ = this.isUserAnAssessorAdmin$.pipe(
    tap(isUserAnAssessorAdmin => console.log(isUserAnAssessorAdmin)),
    filter(isUserAnAssessorAdmin => isUserAnAssessorAdmin),
    switchMap(() => this.store.pipe(select(AssessorDashboardSelectors.selectDashboardResponse))),
    filter(dashboardResponse => isSuccess(dashboardResponse)),
    map(dashboardResponse => (dashboardResponse as any).value),
    withLatestFrom(this.store.select(selectSelectedScheme)),
    map(([dashboardSchemes, selectedScheme]: [ReplySchemeForAssessor[], ReplySchemeForAssessor]) => {
      const scheme = dashboardSchemes.find(scheme => {
        return scheme.id === selectedScheme.id;
      });
      if (scheme?.assessor?.firstName && scheme?.assessor?.lastName) {
        return `${scheme.assessor.firstName} ${scheme.assessor.lastName}`;
      }
      if (scheme?.secondAssessor?.firstName && scheme?.secondAssessor?.lastName) {
        return `${scheme.secondAssessor.firstName} ${scheme.secondAssessor.lastName}`;
      }
      return 'Unassigned';
    })
  );

  categorizedSections: { [key: number]: SubmissionSectionStatusDetailed[] } = {};

  submissionSectionStatus$: Observable<ReplySubmissionGroups[]>;

  SubmissionFormType = SubmissionFormType;
  SubmissionGroupType = SubmissionGroupType;
  SubmissionGroupCategory = SubmissionGroupCategory;
  SubmissionGroupTypeRoutes = SubmissionGroupTypeRoutes;

  StatusEnum = Status;
  AssessorStatusEnum = AssessorStatus;

  isSubmittedOrInReview: boolean;
  isComponentAlive = true;

  selectSubmissionFormId$ = selectSubmissionFormId;

  constructor(
    private readonly store: Store,
    private readonly formSubmissionService: FormSubmissionService,
    private router: Router,
    private apiWarpper: ChqpaApiServiceWrapper,
    private sharedFacade: SharedFacade,
    private ngxSpinner: NgxSpinnerService
  ) {
    this.submissionSectionStatus$ = this.submissionForm$.pipe(map(response => response.sectionStatusList));
  }

  ngOnInit(): void {
    this.submissionSectionStatus$.subscribe(sections => {
      this.categorizeSections(sections);
      this.storeSubmitToAssessorGroupId(sections);
      console.log(this.categorizedSections);
    });

    this.store
      .select(selectIsSubmissionNonEditable)
      .pipe(takeWhile(() => this.isComponentAlive))
      .subscribe(nonEditable => {
        this.isSubmittedOrInReview = nonEditable;
      });

    combineLatest([
      this.isUserAnAssessor$,
      this.isUserAnAssessorAdmin$
    ]).pipe(takeWhile(() => this.isComponentAlive)).subscribe(([isAssessor, isAssessorAdmin]) => {
      if (isAssessor || isAssessorAdmin) {
        this.BACK = '/assessor/dashboard'; // Update the back link for assessors
      } else {
        this.BACK = '../../../request-task-page'; // Default back link for RP
      }
    });

    // User finished completing the section or navigated back at which point we remove all the session data
    this.store.dispatch(resetAllForms());
    // We also need to clear the cache on back navigation not only when we select a new scheme
    this.store.dispatch(resetToInitialState());
  }

  private storeSubmitToAssessorGroupId(sectionsDetails: ReplySubmissionGroups[]): void {
    const submitToAssessorGroupId = this.findSubmitToAssessorGroupId(sectionsDetails);
    this.store.dispatch(setSubmitToAssessorGroupId({ groupId: submitToAssessorGroupId }));
  }

  private findSubmitToAssessorGroupId(sectionsDetails: ReplySubmissionGroups[]): string {
    const submitToAssessorSection = sectionsDetails.find(sectionDetail => sectionDetail.groupType === SubmissionGroupType.SubmitToAssessor);

    return submitToAssessorSection ? submitToAssessorSection.id : undefined;
  }

  readOnlyTableTasks(categoryKey: string): boolean {
    return +categoryKey === SubmissionGroupCategory.SchemeCapacityDetails;
  }

  readOnlyWithLinksTableTasks(categoryKey: string): boolean {
    return +categoryKey === SubmissionGroupCategory.ThresholdDetails;
  }

  hasRelatedActions(formSubmission: FormSubmission): boolean {
    return isF4(formSubmission.submissionFormType);
  }

  buildRelatedActions(formSubmission: FormSubmission): Observable<TextLinkItem[]> {
    return combineLatest([
      this.isUserAnAssessor$,
      this.isUserAnAssessorAdmin$
    ]).pipe(
      map(([isUserAnAssessor, isUserAnAssessorAdmin]) => {
        let relatedActions: TextLinkItem[] = [];

        const isF4SimpleOrComplex = isF4(formSubmission.submissionFormType);

        const f2IsCompleted = formSubmission.sectionStatusList.filter(item => item.groupCategory === 0).every(item => item.status === 2);

        if (isF4SimpleOrComplex && f2IsCompleted && !isUserAnAssessorAdmin && !isUserAnAssessor) {
          relatedActions.push({
            text: 'Upload performance data',
            link: `${FormSubmissionPath.BASE_PATH}/${formSubmission.id}/${FormSubmissionPath.UPLOAD_PERFORMANCE_DATA}`,
          });
        }

        if (isUserAnAssessorAdmin) {
          relatedActions.push({
            text: 'View scheme history',
            link: `${FormSubmissionPath.BASE_PATH}/${formSubmission.id}/${FormSubmissionPath.SCHEME_HISTORY}`,
          });
        }

        return relatedActions;
      })
    )

  }

  isTotalPowerCapUnderMaxHeatConditions(groupType: SubmissionGroupType): boolean {
    return groupType === SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions;
  }

  getRoute(submissionGroupType: SubmissionGroupType, selectedSubmissionId: string): string {
    if (submissionGroupType === SubmissionGroupType.ProvideAuditRecommendation || submissionGroupType === SubmissionGroupType.ProvideAssessmentDecision || submissionGroupType === SubmissionGroupType.ReturnSchemeToRpFromAA) {
      return `/assessor/`.concat(this.SubmissionGroupTypeRoutes[submissionGroupType]) || '#';
    } else {
      return `${FormSubmissionPath.BASE_PATH}/${selectedSubmissionId}/`.concat(this.SubmissionGroupTypeRoutes[submissionGroupType]) || '#';
    }
  }

  setSelectedGroup(submissionGroup: ReplySubmissionGroups, $event: Event) {
    this.store.dispatch(setSubmissionGroup({ submissionGroup }));

    // Temporary hack
    if (submissionGroup.groupType === SubmissionGroupType.AssignSchemeForAssessment) {
      // Hack implemented for Orfeas to move the scheme to the next step
      this.hackAssigningSchemeForAssessment();
    }

    if (submissionGroup.groupType === SubmissionGroupType.SubmitAssessment || submissionGroup.groupType === SubmissionGroupType.ReviewAssessorComments) {
      this.handleAssessmentDecision(submissionGroup.groupType);
    } else if (submissionGroup.groupType === SubmissionGroupType.ProvideAssessmentDecision) {
      this.handleProvideAssessmentDecision();
    } else {
      this.store.pipe(select(selectSubmissionFormId), take(1)).subscribe(submissionFormId => {
        this.router.navigate([this.getRoute(submissionGroup.groupType, submissionFormId)]);
      });
    }
  }

  hackAssigningSchemeForAssessment(): void {
    this.ngxSpinner.show();
      this.store.pipe(select(selectSubmissionFormId), take(1)).subscribe(submissionFormId => {
        this.apiWarpper.assignSchemeForAssessmentService.apiAssessorsAssignSchemeForAssessmentPost({ submissionId: submissionFormId })
          .pipe(
            take(1),
            catchError(error => {
              this.ngxSpinner.hide();
              return of(error);
            })
          )
          .subscribe(data => {
            this.ngxSpinner.hide();
            // Reload the page on success
            window.location.reload();
          });
      });
  }

  private handleProvideAssessmentDecision(): void {
    this.store.pipe(select(selectSubmissionFormId), take(1)).subscribe(submissionFormId => {
      this.apiWarpper.getAssessmentDecision
        .apiAssessorsGetAssessmentDecisionGet(submissionFormId)
        .pipe(take(1))
        .subscribe(data => {
          if (data.certifyChoice !== null) {
            if (data.certifyChoice) {
              this.router.navigate([`/assessor/${ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.schemeCertified}`]);
            } else {
              this.router.navigate([`/assessor/${ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.returnedToFirstAssessor}`]);
            }
          } else {
            this.router.navigate([`/assessor/${ASSESSOR_ROUTE_PATHS.provideAssessmentDecision.readyForCertification}`]);
          }
        });
    });
  }

  private handleAssessmentDecision(submissionGroupType: SubmissionGroupType): void {
    this.store.pipe(select(selectSubmissionFormId), take(1)).subscribe(submissionFormId => {
      this.apiWarpper.getAssessCommentsTA1Service
        .apiSecureGetAssessCommentsTA1Get(submissionFormId)
        .pipe(take(1))
        .subscribe(data => {
          const submissionStatus = (data as any)?.submissionStatus;
          this.store.dispatch(AssessorActions.AssessorSharedActions.updateComments({ payload: (data as any).groupList }));
          if (submissionGroupType === SubmissionGroupType.ReviewAssessorComments) {
            this.router.navigate(['/assessor/review-assessor-comments']);
            return;
          }
          if (submissionStatus !== undefined) {
            switch (submissionStatus) {
              case SubmissionStatus.Approved:
                this.router.navigate(['/assessor/submit-assessment/comments-to-second-assessor']);
                break;
              case SubmissionStatus.Rejected:
                this.router.navigate(['/assessor/confirm-rejection/submit-to-confirm-rejection']);
                break;
              case SubmissionStatus.ReturnedForChanges:
                this.router.navigate(['/assessor/submit-assessment-return-to-rp/comments-to-rp']);
                break;
              default:
                console.log('No specific navigation for this status.');
            }
          } else {
            console.log('Submission status is undefined or not valid.');
          }
        });
    });
  }

  sortByMinDisplayOrder = (a: KeyValue<string, SubmissionSectionStatusDetailed[]>, b: KeyValue<string, SubmissionSectionStatusDetailed[]>): number => {
    const minDisplayOrderA = Math.min(...a.value.map(section => section.displayOrder));
    const minDisplayOrderB = Math.min(...b.value.map(section => section.displayOrder));
    return minDisplayOrderA - minDisplayOrderB;
  };

  private categorizeSections(sections: ReplySubmissionGroups[]) {
    const updatedSections = sections.map(section => ({ ...section }));

    const nullStatusSubsections = updatedSections.filter(s => s.groupCategory === 4);
    const qualityIndexThresholdSubsection = nullStatusSubsections.find(s => s.name === 'Select quality index threshold');

    // For some reason the BE doesnt return status for groupCategory 4 subsections
    // Except for the Select quality index threshold
    // Orfeas mentioned that it will be too much work atm
    // So as a hack we set the status ourselves...at least for now
    if (qualityIndexThresholdSubsection) {
      updatedSections.forEach((element, index) => {
        if (element.groupCategory === 4) {
          updatedSections[index] = { ...element, status: qualityIndexThresholdSubsection.status };
        }
      });
    }
    this.categorizedSections = {};
    updatedSections.forEach((section, index) => {
      const category = section.groupCategory.toString();
      if (!this.categorizedSections[category]) {
        this.categorizedSections = { ...this.categorizedSections, [category]: [] };
      }
      const updatedSection = {
        ...section,
        disabled: this.isSectionDisabled(index, updatedSections),
      };
      this.categorizedSections[category].push(updatedSection);
    });
  }

  private isSectionDisabled(index: number, sections: ReplySubmissionGroups[]): boolean {
    if (index === 0 || sections[index].status === Status.NotStarted) return false;
    if (sections[index].status === Status.NotApplicable) return true;
    for (let i = index - 1; i >= 0; i--) {
      if (sections[i].status !== null && sections[i].status != Status.NotApplicable) {
        return sections[i].status !== Status.Completed;
      }
    }

    return false;
  }

  returnToDashboard(): void {

    combineLatest([
      this.isUserAnAssessor$,
      this.isUserAnAssessorAdmin$
    ]).pipe((take(1))).subscribe(([isAssessor, isAssessorAdmin]) => {
      if (isAssessor || isAssessorAdmin) {
        this.router.navigate(['/assessor'])
      } else {
        this.router.navigate(['/request-task-page']);
      }
    });
  }

  isGroupTypeForAssessor(groupType: number) {
    const assessorGroupTypes = [
      SubmissionGroupType.SubmitAssessment,
      SubmissionGroupType.ProvideAssessmentDecision,
      SubmissionGroupType.AssignSchemeForAssessment,
      SubmissionGroupType.ReturnSchemeToRpFromAA,
      SubmissionGroupType.SetPoliciesAndThermalEfficiency,
    ];
    return assessorGroupTypes.includes(groupType);
  }

  isAssessorAdminGroupType(groupType: number) {
    const assessorAdminGroupTypes = [
      SubmissionGroupType.AssignSchemeForAssessment,
      SubmissionGroupType.ReturnSchemeToRpFromAA,
      SubmissionGroupType.SetPoliciesAndThermalEfficiency,
    ];
    return assessorAdminGroupTypes.includes(groupType);
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
