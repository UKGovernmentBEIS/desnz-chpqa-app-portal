import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { SchemeStatus } from '@shared/enums/scheme-status.enum';
import { Status, SubmissionStatus } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { TrueFalsePipe } from '@shared/pipes/true-false.pipe';
import { selectSelectedScheme, selectSubmissionFormId } from '@shared/store';
import { isSuccess } from 'ngx-remotedata';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Observable, Subscription, take, takeWhile } from 'rxjs';
import { ReplyAuditRec, ReplyScheme } from 'src/app/api-services/chpqa-api/generated';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { SchemeRegistration } from 'src/app/tasks/scheme-registration/models/scheme-registration.model';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { AssessorActions } from '../../../store/assessor.actions';
import { AssessorFacade } from '../../../store/assessor.facade';
import { ReasonsForAuditFormState } from '../audit-recomendation.config';
import { ReviewDecisionFacade } from '../../../../../features/assessor/components/review-decision/store/review-decision.facade';

@Component({
  selector: 'app-assessor-audit-recommendation-confirm-your-answers',
  standalone: true,
  templateUrl: './assessor-audit-recommendation-confirm-your-answers.component.html',
  styleUrls: ['./assessor-audit-recommendation-confirm-your-answers.component.scss'],
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
  providers: [TrueFalsePipe, ReviewDecisionFacade],
})
export class AssessorAuditRecommendationConfirmYourAnswersComponent implements OnInit, OnDestroy {
  backButton = '';
  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;
  selectedScheme$: Observable<ReplyScheme> = this.store.select(selectSelectedScheme);
  SubmissionStatus = SubmissionStatus;
  isAssessorFormEditable = false;
  isComponentAlive = true;
  private subscriptions = new Subscription();

  constructor(
    private readonly store: Store,
    private ngxSpinner: NgxSpinnerService,
    private trueFalsePipe: TrueFalsePipe,
    private assessorFacade: AssessorFacade,
    private reviewDecisionFacade: ReviewDecisionFacade,
  ) {}

  ngOnInit() {
    this.ngxSpinner.show();
    this.subscriptions.add(
      combineLatest([
        this.assessorFacade.auditRecommendationsFacade.stateObservables.isRecommendedFormState$,
        this.assessorFacade.auditRecommendationsFacade.stateObservables.reasonsForAuditFormState$,
        this.assessorFacade.auditRecommendationsFacade.stateObservables.auditRecommendationsApiResponse$,
        this.store.select(selectSectionStatus(SubmissionGroupType.ProvideAuditRecommendation)),
        this.store.select(selectSubmissionFormId),
      ]).subscribe(([isRecommendedFormState, reasonsForAuditFormState, auditRecommendationsApiResponse, sectionStatus, submissionFormId]) => {
        const isRecommended = isRecommendedFormState?.isRecommended?.value;
        this.sectionStatus = sectionStatus;
        if (this.sectionStatus !== Status.Completed) {
          if (isRecommended) {
            this.backButton = `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.reasonsForAudit}`;
          } else {
            this.backButton = `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.isForAudit}`;
          }
        } else {
          this.backButton = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`;
        }

        if (isSuccess(auditRecommendationsApiResponse)) {
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(
            isRecommended,
            reasonsForAuditFormState,
            (auditRecommendationsApiResponse as any).value
          );
        }
        this.ngxSpinner.hide();
      })
    );

    this.reviewDecisionFacade.isAssessorFormEditable$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(isAssessorFormEditable => {
      this.isAssessorFormEditable = isAssessorFormEditable;
    });
  }

  handleFormSubmitted(): void {
    if (!this.isAssessorFormEditable) {
      this.store.dispatch(AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendationsSuccess());
    } else {
    this.store.select(selectSubmissionFormId) // Use the correct selector
      .pipe(take(1))
      .subscribe(() => {
        this.store.dispatch(AssessorActions.AssessorAuditRecommendationActions.setAuditRecommendations());
      });
    }
  }

  private generateReviewYourAnswersFieldConfigs(
    isRecommended: boolean,
    reasonsForAuditFormState: ReasonsForAuditFormState,
    auditRecommendationsApiResponse: ReplyAuditRec
  ): ReviewFieldConfig[] {
    let reasonsForAuditValue = [];
    const technicalPerformanceConcernsValue =
      reasonsForAuditFormState?.technicalPerformanceConcerns !== null && reasonsForAuditFormState?.technicalPerformanceConcerns !== undefined
        ? reasonsForAuditFormState.technicalPerformanceConcerns
        : auditRecommendationsApiResponse.technicalPerformanceConcerns;

    const complianceConcernsValue =
      reasonsForAuditFormState?.complianceConcerns !== null && reasonsForAuditFormState?.complianceConcerns !== undefined
        ? reasonsForAuditFormState.complianceConcerns
        : auditRecommendationsApiResponse.complianceConcerns;

    if (technicalPerformanceConcernsValue) {
      reasonsForAuditValue.push('Technical performance concerns');
    }
    if (complianceConcernsValue) {
      reasonsForAuditValue.push('Compliance concerns');
    }

    const isRecommendedValue = isRecommended !== null && isRecommended !== undefined ? isRecommended : auditRecommendationsApiResponse.isRecommended;

    const isRecommendedChangeLink = `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.isForAudit}`;
    const reasonsForAuditChangeLink = `/assessor/${ASSESSOR_ROUTE_PATHS.auditRecommendation.reasonsForAudit}`;

    let reviewAnswers: ReviewFieldConfig[] = [
      {
        name: 'isRecommended',
        label: 'Recommended for audit?',
        type: 'text',
        changeLink: isRecommendedChangeLink,
        showChangeLink: true,
        value: this.trueFalsePipe.transform(isRecommendedValue),
        ariaLabel: ChangeLinkAriaLabel.RECOMMEND_FOR_AUDIT
      },
    ];
    if (isRecommendedValue) {
      reviewAnswers = [
        ...reviewAnswers,
        {
          name: 'reasonsForAudit',
          label: 'Reasons for audit',
          type: 'text',
          changeLink: reasonsForAuditChangeLink,
          showChangeLink: true,
          value: reasonsForAuditValue.join(', '),
          ariaLabel: ChangeLinkAriaLabel.REASONS_RECOMMEND_FOR_AUDIT
        },
        {
          name: 'commentsForAudit',
          label: 'Comments for the auditor',
          type: 'textarea',
          changeLink: reasonsForAuditChangeLink,
          showChangeLink: true,
          value: reasonsForAuditFormState?.comments || auditRecommendationsApiResponse?.comments || '',
          ariaLabel: ChangeLinkAriaLabel.COMMENTS_FOR_AUDITOR
        },
      ];
    }
    return reviewAnswers;
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.isComponentAlive = false;
  }
}
