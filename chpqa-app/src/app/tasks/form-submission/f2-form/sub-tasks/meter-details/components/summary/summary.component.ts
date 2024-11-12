import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest, first, Subscription, take } from 'rxjs';
import { MetricsSummaryListComponent } from '@shared/components/metrics-summary-list/metrics-summary-list.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { addAnotherMeter, deleteMeter, downloadMeterFile, selectMeterDeletionInformation, submitMeters, updateMeter } from '../../store';
import { selectIsSubmissionNonEditable, selectSelectedScheme, selectSubmissionFormId, SharedFacade } from '@shared/store';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { Meter } from '@shared/models/form-submission.model';
import { MetricsSummaryList } from '@shared/models/summary-lists';
import { EquipmentService } from '../../../../services/equipment.service';
import { selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { MeterFacade } from '../../store/meter.facade';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { SchemeStatus } from '@shared/enums/scheme-status.enum';
import { GovukNotificationBannerComponent } from '@shared/components/govuk-notification-banner/govuk-notification-banner.component';
import { AssessorReviewDecisionForm, AssessorReviewDecisionFormInfo } from '@shared/models/assessor-review-decision-form.model';
import { ReviewDecisionFormComponent } from 'src/app/features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SubmissionStatus } from '@shared/enums/status.enum';

@Component({
  selector: 'app-meter-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DynamicFormErrorsSummaryComponent,
    MetricsSummaryListComponent,
    PaginationComponent,
    GovukNotificationBannerComponent,
    ReviewDecisionFormComponent,
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.METER_DOCUMENTATION}`;
  form: FormGroup;
  meters: Meter[] = [];
  submissionFormType: SubmissionFormType;
  submissionId = '';
  meterFlowTypeId = '';

  ADD_METER: string;
  METER_DOCUMENTATION: string;
  EXISTENCE: string;
  OUTPUT_RANGE: string;
  FISCAL_CHECK: string;
  REVIEW_ANSWERS: string;
  SUBTYPE: string;
  UNCERTAINTY: string;
  MEASURE_TYPE: string;

  itemsPerPage = 20;
  currentPage = 1;
  SubmissionFormTypeEnum = SubmissionFormType;
  SubmissionStatusEnum = SubmissionStatus;
  latestSubmissionStatus: SubmissionStatus;

  isUserAnAssessor: boolean;
  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: unknown;

  isSubmissionNonEditable$ = this.store.select(selectIsSubmissionNonEditable);

  showDeleteSuccessBanner = false;
  meterDeletionInformation$ = this.store.select(selectMeterDeletionInformation);

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
    private equipmentService: EquipmentService,
    private meterFacade: MeterFacade,
    private spinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.spinner.show();

    combineLatest([
      this.store.select(selectSubmissionFormId),
      this.store.select(selectFormSubmissionType),
      this.equipmentService.getMeterFlowTypeId(),
      this.store.select(selectSelectedScheme),
      this.meterFacade.meters$,
      this.meterFacade.showDeleteSuccessBanner$,
      this.sharedFacade.isUserAnAssessor(),
    ])
      .pipe(take(1))
      .subscribe(([submissionId, submissionFormType, meterFlowTypeId, selectSelectedScheme, meters, showDeleteSuccessBanner, isUserAnAssessor]) => {
        this.submissionId = submissionId;
        this.submissionFormType = submissionFormType;
        this.meterFlowTypeId = meterFlowTypeId;
        this.latestSubmissionStatus = selectSelectedScheme.latestSubmissionStatus;
        this.meters = meters;
        this.setUrls();
        this.showDeleteSuccessBanner = showDeleteSuccessBanner;
        this.isUserAnAssessor = isUserAnAssessor;
      });
    this.isSubmittingSubscription = this.meterFacade.isSubmittingMeters$.subscribe(isSubmitting => {
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
    this.meterFacade.hideDeleteSuccessBanner();
  }

  get paginatedMeters(): Meter[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.meters.slice(startIndex, startIndex + this.itemsPerPage);
  }

  handleDelete(id: string, index: number, meterName: string) {
    this.store.dispatch(deleteMeter({ id: id, index: index, name: meterName }));
  }

  handleChange(meter: Meter, index: number) {
    this.store.dispatch(updateMeter({ meter: meter, index: index }));
  }

  addAnotherMeter() {
    this.store.dispatch(addAnotherMeter());
  }

  onContinue() {
    if (this.isSubmissionEditable()) {
      this.store.dispatch(submitMeters());
    } else {
      this.navigateToTaskList();
    }
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

  onDownloadFile(event: { fileId: string; fileName: string }): void {
    this.store.dispatch(downloadMeterFile({ id: event.fileId, fileName: event.fileName }));
  }

  handleAssessorFormInfo(event: AssessorReviewDecisionFormInfo) {
    this.assessorForm = event?.assessorForm;
    this.assessorFormUpdated = event?.assessorFormUpdated;
    this.assessorFormValidationMessages = event?.assessorFormValidationMessages;

    this.cdRef.detectChanges();
  }

  handleAssessorFormSubmission(event: { formValue: AssessorReviewDecisionForm; reviewScreenName: string }) {
    this.sharedFacade.handleAssessorFormSubmission(event);
  }

  mapMeterToDetails(meter: Meter): MetricsSummaryList[] {
    const details: MetricsSummaryList[] = [
      {
        key: 'Tag number',
        value: meter?.tagNumber ?? '',
        changeLocation: this.ADD_METER,
        ariaLabel: ChangeLinkAriaLabel.TAG_NUMBER,
      },
      {
        key: 'Serial number',
        value: meter?.serialNumber ?? '',
        changeLocation: this.ADD_METER,
        ariaLabel: ChangeLinkAriaLabel.METER_SERIAL_NUMBER,
      },
      {
        key: 'Year installed',
        value: meter?.yearInstalled.name ?? '',
        changeLocation: this.ADD_METER,
        ariaLabel: ChangeLinkAriaLabel.YEAR_INSTALLED,
      },
      {
        key: 'Meter sub type',
        value: meter?.meterType.name ?? '',
        changeLocation: this.SUBTYPE,
        ariaLabel: ChangeLinkAriaLabel.METER_SUB_TYPE,
      },
      {
        key: 'What will the meter measure? ',
        value: meter?.measureType.label ?? '',
        changeLocation: this.MEASURE_TYPE,
        ariaLabel: ChangeLinkAriaLabel.METER_MEASUREMNT,
      },
      {
        key: 'Existing or proposed?',
        value: meter?.existingOrProposed?.label,
        changeLocation: this.EXISTENCE,
        ariaLabel: ChangeLinkAriaLabel.METER_EXISTING_PROPOSED,
      },
      {
        key: 'Minimum flow rate',
        value: meter?.outputRangeMin,
        changeLocation: this.OUTPUT_RANGE,
        ariaLabel: ChangeLinkAriaLabel.OUTPUT_RANGE,
      },
      {
        key: 'Maximum flow rate',
        value: meter?.outputRangeMax,
        changeLocation: this.OUTPUT_RANGE,
        ariaLabel: ChangeLinkAriaLabel.OUTPUT_RANGE,
      },
      {
        key: 'Output units',
        value: meter?.outputUnit.name,
        changeLocation: this.OUTPUT_RANGE,
        ariaLabel: ChangeLinkAriaLabel.OUTPUT_UNITS,
      },
      {
        key: 'Uploaded documents',
        value: '',
        changeLocation: this.METER_DOCUMENTATION,
        files: meter?.files,
        ariaLabel: ChangeLinkAriaLabel.METER_DOCUMENTS,
      },
      {
        key: this.isAnAssessor ? 'RP comments' : 'Your comments',
        value: meter?.comments ?? '',
        changeLocation: this.METER_DOCUMENTATION,
        ariaLabel: ChangeLinkAriaLabel.METER_COMMENTS,
      },
    ];

    if (this.submissionFormType === SubmissionFormType.F4) {
      const uploadDocsIndex = details.findIndex(detail => detail.key === 'Uploaded documents');
      if (uploadDocsIndex >= 0) {
        details.splice(uploadDocsIndex, 0, {
          key: 'Uncertainty',
          value: meter?.uncertainty !== null ? `${meter.uncertainty}%` : 'N/A',
          changeLocation: this.UNCERTAINTY,
          ariaLabel: ChangeLinkAriaLabel.UNCERTAINTY,
        });
      }
    }
    const existingIndex = details.findIndex(detail => detail.changeLocation === this.EXISTENCE);
    if (meter?.meterType.id === this.meterFlowTypeId) {
      details.splice(existingIndex + 1, 0, {
        key: 'Main fiscal meter?',
        value: meter?.fiscal ? 'Yes' : 'No',
        changeLocation: this.FISCAL_CHECK,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT,
      });
    }
    if (meter?.fiscal) {
      details.splice(existingIndex + 2, 0, {
        key: 'Meter point reference number',
        value: meter?.fiscalPoint,
        changeLocation: this.FISCAL_CHECK,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT,
      });
    }
    return details;
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.isAnAssessor = true;
        this.formHeader = 'Review meters';
      } else {
        this.isAnAssessor = false;
        this.formHeader = 'Check your answers';
      }
    });
  }

  private setUrls(): void {
    this.ADD_METER = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.ADD_METER}`;
    this.METER_DOCUMENTATION = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_DOCUMENTATION}`;
    this.EXISTENCE = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_EXISTENCE}`;
    this.OUTPUT_RANGE = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_OUTPUT_RANGE}`;
    this.FISCAL_CHECK = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_FISCAL_CHECK}`;
    this.REVIEW_ANSWERS = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.METER_REVIEW_ANSWERS}`;
    this.SUBTYPE = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_TYPE}`;
    this.UNCERTAINTY = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_UNCERTAINTY}`;
    this.MEASURE_TYPE =  `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/${FormSubmissionPath.METER_MEASUREMENT}`;
  }

  private isSubmissionEditable(): boolean {
    return this.latestSubmissionStatus <= this.SubmissionStatusEnum.DueForRenewal;
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
