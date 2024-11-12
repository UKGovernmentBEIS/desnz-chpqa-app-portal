import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest, first, Subscription, take } from 'rxjs';
import { MetricsSummaryListComponent } from '@shared/components/metrics-summary-list/metrics-summary-list.component';
import { addAnotherPrimeMover, deletePrimeMover, downloadPrimeMoverFile, submitPrimeMovers, updatePrimeMover } from '../../store/prime-mover.actions';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { PrimeMover } from '@shared/models/form-submission.model';
import { selectLatestSubmissionStatus, selectSelectedScheme, selectSubmissionFormId, SharedFacade } from '@shared/store';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { MetricsSummaryList } from '@shared/models/summary-lists';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { PrimeMoverFacade } from '../../store/prime-mover.facade';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { GovukNotificationBannerComponent } from '@shared/components/govuk-notification-banner/govuk-notification-banner.component';
import { selectPrimeMoverDeletionInformation } from '../../store';
import { AssessorReviewDecisionFormInfo, AssessorReviewDecisionFormSubmitData } from '@shared/models/assessor-review-decision-form.model';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReviewDecisionFormComponent } from 'src/app/features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SubmissionStatus } from '@shared/enums/status.enum';

@Component({
  selector: 'app-prime-mover-review-answers',
  standalone: true,
  templateUrl: './prime-mover-review-answers.component.html',
  styleUrl: './prime-mover-review-answers.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DynamicFormErrorsSummaryComponent,
    GovukNotificationBannerComponent,
    MetricsSummaryListComponent,
    PaginationComponent,
    ReviewDecisionFormComponent,
  ]
})
export class PrimeMoverReviewAnswersComponent {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.PRIME_MOVER_DOCUMENTATION}`;
  primeMovers: PrimeMover[] = [];
  submissionId = '';
  submissionFormType: SubmissionFormType;

  ADD_PRIME_MOVER: string;
  MECHANICAL_LOAD: string;
  ENGINE_TYPE: string;
  ENGINE: string;
  MANUFACTURER: string;
  ENGINE_MODEL: string;
  DOCUMENTATION: string;

  SubmissionFormTypeEnum = SubmissionFormType;
  SubmissionStatusEnum = SubmissionStatus;
  itemsPerPage = 20;
  currentPage = 1;
  latestSubmissionStatus: SubmissionStatus;

  isUserAnAssessor: boolean;
  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: unknown;

  isSubmissionNonEditable$ = this.sharedFacade.isSubmissionNonEditable();
  showDeleteSuccessBanner = false;
  primeMoverDeletionInformation$ = this.store.select(selectPrimeMoverDeletionInformation);

  formHeader: string = '';

  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  isAnAssessor = false;

  private isSubmittingSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private readonly store: Store,
    private location: Location,
    private cdRef: ChangeDetectorRef,
    private primeMoverFacade: PrimeMoverFacade,
    private spinner: NgxSpinnerService,
    private sharedFacade: SharedFacade,
  ) {
  }

  ngOnInit(): void {
    this.spinner.show();
    combineLatest([
      this.store.select(selectSubmissionFormId),
      this.store.select(selectFormSubmissionType),
      this.store.select(selectSelectedScheme),
      this.sharedFacade.isUserAnAssessor(),
      this.primeMoverFacade.primeMovers$,
      this.primeMoverFacade.showDeleteSuccessBanner$
    ])
      .pipe()
      .subscribe(([submissionId, submissionFormType, selectSelectedScheme,isUserAnAssessor, primeMovers, showDeleteSuccessBanner]) => {
        this.submissionId = submissionId;
        this.submissionFormType = submissionFormType;
        this.latestSubmissionStatus = selectSelectedScheme.latestSubmissionStatus;
        this.isUserAnAssessor = isUserAnAssessor;
        this.setUrls();
        this.primeMovers = primeMovers;
        this.showDeleteSuccessBanner = showDeleteSuccessBanner
        this.spinner.hide();
      });

    this.isSubmittingSubscription = this.primeMoverFacade.isSubmittingPrimeMovers$.subscribe(isSubmitting => {
      if (isSubmitting) {
        this.spinner.show();
      } else {
        this.spinner.hide();
      }
    });

    this.setFormHeader();
  }

  ngOnDestroy(): void {
    this.isSubmittingSubscription.unsubscribe();
    this.primeMoverFacade.hideDeleteSuccessBanner();
  }

  get paginatedPrimeMovers(): PrimeMover[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.primeMovers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  handleAssessorFormInfo(event: AssessorReviewDecisionFormInfo) {
    this.assessorForm = event?.assessorForm;
    this.assessorFormUpdated = event?.assessorFormUpdated;
    this.assessorFormValidationMessages = event?.assessorFormValidationMessages;

    this.cdRef.detectChanges();
  }

  handleAssessorFormSubmission(event: AssessorReviewDecisionFormSubmitData) {
    this.sharedFacade.handleAssessorFormSubmission(event);
  }

  onContinue() {
    if (this.isSubmissionEditable()) {
      this.store.dispatch(submitPrimeMovers());
    } else {
      this.navigateToTaskList();
    }
  }

  handleDelete(id: string, index: number, primeMoverName: string) {
    this.store.dispatch(deletePrimeMover({ id: id, index: index, name: primeMoverName }));
  }

  addAnotherPrimeMover() {
    this.store.dispatch(addAnotherPrimeMover());
  }

  handleChange(primeMover: PrimeMover, index: number) {
    this.store.dispatch(updatePrimeMover({ primeMover: primeMover, index: index }));
  }

  mapPrimeMoverToDetails(primeMover: PrimeMover): MetricsSummaryList[] {
    return [
      {
        key: 'Tag number',
        value: primeMover?.tagNumber ?? '',
        changeLocation: this.ADD_PRIME_MOVER,
        ariaLabel: ChangeLinkAriaLabel.TAG_NUMBER
      },
      {
        key: 'Year commissioned',
        value: primeMover?.yearCommissioned.name ?? '',
        changeLocation: this.ADD_PRIME_MOVER,
        ariaLabel: ChangeLinkAriaLabel.YEAR_COMMISIONED
      },
      {
        key: 'Engine Type',
        value: primeMover?.engineType.name ?? '',
        changeLocation: this.ENGINE_TYPE,
        ariaLabel: ChangeLinkAriaLabel.PRIME_MOVER_ENGINE_TYPE
      },
      {
        key: 'Mechanical load?',
        value: primeMover?.mechanicalLoad?.label,
        changeLocation: this.MECHANICAL_LOAD,
        ariaLabel: ChangeLinkAriaLabel.MECHANICAL_LOAD
      },
      {
        key: 'Manufacturer',
        value: primeMover?.manufacturer.name ?? '',
        changeLocation: this.MANUFACTURER,
        ariaLabel: ChangeLinkAriaLabel.PRIME_MOVER_MANUFACTURER
      },
      {
        key: 'Model',
        value: primeMover?.model.name ?? '',
        changeLocation: this.ENGINE_MODEL,
        ariaLabel: ChangeLinkAriaLabel.PRIME_MOVER_MODEL
      },
      {
        key: 'Engine',
        value: primeMover?.engineName?.name ?? '',
        changeLocation: this.ENGINE,
        ariaLabel: ChangeLinkAriaLabel.PRIME_MOVER_ENGINE
      },
      {
        key: 'Total heat output',
        value: primeMover?.totalHeatOutputKw + ' kWh',
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Total power capacity',
        value: primeMover?.totalPowerCapacityKw + ' kWe',
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Fuel input',
        value: primeMover?.fuelInputKw + ' kWe',
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Power efficiency',
        value: primeMover?.powerEfficiency,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Max heat to power ratio',
        value: primeMover?.maxHeatToPowerRatio,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Max heat efficiency',
        value: primeMover?.maxHeatEfficiency,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Max overall efficiency',
        value: primeMover?.maxOverallEfficiency,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT
      },
      {
        key: 'Uploaded documents',
        value: '',
        changeLocation: this.DOCUMENTATION,
        files: primeMover?.files,
        ariaLabel: ChangeLinkAriaLabel.PRIME_MOVER_DOCUMENTS
      },
      {
        key: this.isAnAssessor ? 'RP comments' : 'Your comments',
        value: primeMover?.comments ?? '',
        changeLocation: this.DOCUMENTATION,
        ariaLabel: ChangeLinkAriaLabel.PRIME_MOVER_COMMENTS,
      },
    ];
  }

  goBack(): void {
    if ((this.isSubmissionEditable() && !this.showDeleteSuccessBanner) || this.latestSubmissionStatus > SubmissionStatus.DueForRenewal) {
      this.location.back();
    } else {
      this.navigateToTaskList();
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  calculateIndex(idx: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + idx;
  }

  onDownloadFile(event:{fileId: string, fileName: string}): void {
  this.store.dispatch(downloadPrimeMoverFile({ id: event.fileId, fileName:event.fileName }));
  }

  private setUrls(): void {
    this.ADD_PRIME_MOVER = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.ADD_PRIME_MOVER}`;
    this.MECHANICAL_LOAD = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.PRIME_MOVER_MECHANICAL_LOAD}`;
    this.ENGINE_TYPE = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_TYPE}`;
    this.ENGINE = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE}`;
    this.MANUFACTURER = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_MANUFACTURER}`;
    this.ENGINE_MODEL = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.PRIME_MOVER_ENGINE_MODEL}`;
    this.DOCUMENTATION = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.PRIME_MOVER_DOCUMENTATION}`;
  }

  private isSubmissionEditable(): boolean {
    return this.latestSubmissionStatus  <= this.SubmissionStatusEnum.DueForRenewal;
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review prime movers';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }
}
