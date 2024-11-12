import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { RadioButtonOption } from '@shared/models/radio-button-option.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, first, map, Observable, take } from 'rxjs';
import { SummaryComponent } from 'src/app/tasks/form-submission/components/summary/summary.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { selectQualityIndexThreshold, setQualityIndexThreshold, submitQualityIndexThreshold } from '../../../store';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';

@Component({
  selector: 'app-quality-index-threshold-summary',
  standalone: true,
  imports: [CommonModule, SummaryComponent, ReviewAnswersComponent],
  templateUrl: './summary.component.html'
})
export class QualityIndexThresholdSummaryComponent implements OnInit {
  qualityIndexThresholdStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.QualityIndexThreshold)));

  qualityIndexThresholdOptions = [
    { label: 'Initial operation - 95 quality index', value: 95 },
    { label: 'Full operation - 100 quality index', value: 100 }, //TODO align with backend
  ];

  selectSubmissionForm$ = this.store.pipe(select(selectSubmissionForm));
  qualityIndexThresholdSummary$ = this.store.select(selectQualityIndexThreshold);
  backButton$: Observable<string> = this.qualityIndexThresholdStatus$.pipe(
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.QUALITY_INDEX_THRESHOLD}`;
      }
    })
  );
  private isSubmissionNonEditable: boolean;
  isAnAssessor = false;

  reviewScreenValues: any[] = [];

  generateReviewYourAnswersFieldConfigs(radioButtonOption: RadioButtonOption): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const inputLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.QUALITY_INDEX_THRESHOLD}`;

    return [
      {
        name: 'selectedThreshold',
        label: 'Selected threshold',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: radioButtonOption?.label,
        ariaLabel: ChangeLinkAriaLabel.SELECTED_THRESHOLD
      },
    ];
  }

  constructor(
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.ngxSpinner.show();

    const nonEditableSubmission$ = this.sharedFacade.isSubmissionNonEditable();

    combineLatest([
      this.selectSubmissionForm$,
      this.qualityIndexThresholdSummary$,
      nonEditableSubmission$
    ])
      .pipe(first())
      .subscribe(([
        thresholdDB,
        thresholdState,
        nonEditableSubmission
      ]) => {
        if (!thresholdState) {
          thresholdDB?.qualityIndexThreshold === 95
            ? this.store.dispatch(setQualityIndexThreshold({ qualityIndexThreshold: this.qualityIndexThresholdOptions[0] }))
            : this.store.dispatch(setQualityIndexThreshold({ qualityIndexThreshold: this.qualityIndexThresholdOptions[1] }));
        }

        this.qualityIndexThresholdSummary$.pipe(take(1)).subscribe(data => {
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(data);
        });

        this.isSubmissionNonEditable = nonEditableSubmission;
        this.ngxSpinner.hide();
      });
      this.sharedFacade
      .isUserAnAssessor()
      .pipe(take(1))
      .subscribe(isAnAssessor => {
        this.isAnAssessor = isAnAssessor;
      });
  }

  handleFormSubmitted($event: any): void {
    this.isSubmissionNonEditable
      ? this.navigationService.navigateToTaskList()
      : this.store.dispatch(submitQualityIndexThreshold());
  }
}
