import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { submitAssessmentCopy } from '../../../config/assessor-web-copy.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { CommonModule } from '@angular/common';
import { CommentsSummaryComponent } from '../../../components/review-decision/pages/comments-summary/comments-summary.component';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Component({
  selector: 'app-assessor-submit-assessment-comments-to-second-assessor',
  standalone: true,
  templateUrl: './assessor-submit-assessment-comments-to-second-assessor.component.html',
  imports: [CommonModule, RouterModule, CommentsSummaryComponent],
})
export class AssessorSubmitAssessmentCommentsToSecondAssessorComponent {
  basePath$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}`;
    })
  );
  comments$ = this.assessorFacade.sharedFacade.stateObservables.comments$;
  // UI Translations for the page
  copy = submitAssessmentCopy.screen1;

  isComponentAlive = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private assessorFacade: AssessorFacade,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  onContinue() {
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.submitAssessment.selectSecondAssessor}`], {
      relativeTo: this.route,
    });
  }
}
