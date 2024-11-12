import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Status, SubmissionStatus } from '@shared/enums/status.enum';
import { AssessorReviewDecisionForm, AssessorReviewDecisionFormInfo } from '@shared/models/assessor-review-decision-form.model';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { selectSelectedScheme, SharedFacade } from '@shared/store';
import { RemoteData } from 'ngx-remotedata';
import { NgxSpinnerModule } from 'ngx-spinner';
import { map, Observable, Subject, takeWhile } from 'rxjs';
import { ReviewDecisionFormComponent } from 'src/app/features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component';
import { DynamicFormErrorsSummaryComponent } from '../dynamic-form-builder/components/dynamic-form-errors-summary';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';
import { selectUser } from 'src/app/auth/auth.selector';
import { UserType } from '@shared/enums/user-type.enum';

@Component({
  selector: 'app-review-answers',
  standalone: true,
  imports: [CommonModule, DynamicFormErrorsSummaryComponent, RouterModule, NgxSpinnerModule, ReviewDecisionFormComponent],
  templateUrl: './review-answers.component.html',
  styleUrls: ['./review-answers.component.scss'],
})
export class ReviewAnswersComponent implements OnInit, OnDestroy {
  @Input() formTitle: string;
  @Input() formHeader: string = 'Check your answers';
  @Input() backLink: string;
  @Input() reviewScreenValues: ReviewFieldConfig[];
  @Input() sectionStatus: Status;
  @Input() customWidthClass: string = 'govuk-!-width-two-thirds';
  @Input() isAssessorReview?: boolean;
  @Output() formSubmitted = new EventEmitter<any>();
  StatusEnum = Status;

  SubmissionStatusEnum = SubmissionStatus;
  selectedScheme$: Observable<ReplyScheme> = this.store.select(selectSelectedScheme);
  isUserAnAssessor$ = this.store.pipe(
    select(selectUser),
    map(user => user?.userType === UserType.TechnicalAssessor ||  user?.userType === UserType.TechnicalAssessor2)
  );
  isUserAnAssessorAdmin$ = this.store.pipe(
    select(selectUser),
    map(user => user?.userType === UserType.AssessorAdmin)
  );
  isComponentAlive = true;

  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: any;
  apiDownloadFiles$: Observable<RemoteData<Blob, HttpErrorResponse>> = this.sharedFacade.apiDownloadFile$;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private cdRef: ChangeDetectorRef,
    private sharedFacade: SharedFacade,
    private store: Store<any>,
    private location: Location
  ) {}

  ngOnInit(): void {
    // DONT TOUCH THIS OR I KILL YOU - PAV
    this.isUserAnAssessor$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(isUserAnAssessor => {
      if (this.isAssessorReview === undefined) {
        this.isAssessorReview = isUserAnAssessor;
      }
    });
    this.registerLoadingSpinnerForApiResponses();
  }

  handleFormSubmitted(event: any): void {
    this.formSubmitted.emit(event);
  }

  onSubmit(): void {
    this.formSubmitted.emit();
  }

  trackByIndex(index: number, item: any): number {
    return index;
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

  onDownloadFile(fileId: string, fileName: string): void {
    this.sharedFacade.downloadFile(fileId, fileName);
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private registerLoadingSpinnerForApiResponses(): void {
    this.sharedFacade.showLoadingSpinnerForApiResponses([this.apiDownloadFiles$], this.unsubscribe$);
  }

  goBack(): void {
    this.location.back();
  }
}
