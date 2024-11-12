import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { filterSuccess } from 'ngx-remotedata';
import { combineLatest, take } from 'rxjs';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { Status } from '@shared/enums/status.enum';
import { RequestSubmDueDateConf } from 'src/app/api-services/chpqa-api/generated';

@Component({
  selector: 'app-assessor-set-last-submission-date-check-your-answers',
  standalone: true,
  templateUrl: './assessor-set-last-submission-check-your-answers.component.html',
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
})
export class AssessorSetLastSubmissionDateCheckYourAnswersComponent implements OnInit, OnDestroy {
  getLastSubmissionDate$ = this.assessorFacade.setLastSubmissionDateFacade.stateObservables.selectGetLastSubmissionDatesResponse$;
  isComponentAlive = true;
  backButton = `/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.dashboard}`;
  reviewScreenValues = [];
  isAssessorReview = false;
  status = Status.InProgress;
  latestSubmissionDate = '';
  submittedSubmissionDate; 
  constructor(
    private router: Router,
    private assessorFacade: AssessorFacade
  ) {}

  ngOnInit(): void {
    this.assessorFacade.setLastSubmissionDateFacade.dispatchActions.getLastSubmissionDate();
    this.assessorFacade.showLoadingSpinnerForApiResponses([this.getLastSubmissionDate$], this.isComponentAlive);

    this.handleSuccessApiResponse();
  }

  handleSuccessApiResponse(): void {
    combineLatest([this.getLastSubmissionDate$.pipe(filterSuccess()), this.assessorFacade.setLastSubmissionDateFacade.stateObservables.selectUpdatedSubmissionDate$])
      .pipe(take(1))
      .subscribe((dates: any) => {
        const date = dates[1] ?? dates[0]?.value?.submDueDate ?? null;
        if (date) {
            this.generateReviewYourAnswersFieldConfigs(date);
        } else {
            this.router.navigate([`/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.enterFinalDate}`]);
        }
      });
  }

  private generateReviewYourAnswersFieldConfigs(getLastSubmissionDate: any): void {
    const submDueDate = getLastSubmissionDate;
    this.submittedSubmissionDate = getLastSubmissionDate;

    let formattedDate = '';
    if (submDueDate) {
      const date = new Date(submDueDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedDate = `${day}/${month}/${year}`;
    }

    this.latestSubmissionDate = formattedDate;
    this.assessorFacade.setLastSubmissionDateFacade.dispatchActions.updateSubmissionDate(this.submittedSubmissionDate);
  }

  change($event: any): void {
    $event.preventDefault();
    this.router.navigate([`/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.enterFinalDate}`]);
  }

  onSubmit() {
    if (this.submittedSubmissionDate) {
        const payload: RequestSubmDueDateConf = {
            submDueDate: this.submittedSubmissionDate
        }
        this.assessorFacade.setLastSubmissionDateFacade.dispatchActions.setLastSubmissionDate(payload)
    }
  }

  goBack(): void {
    this.router.navigate([`/${ASSESSOR_ROUTE_PATHS.assessor}`]);
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
