import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { confirmRejectionCopy } from '../../../config/assessor-web-copy.config';
import { CommonModule } from '@angular/common';
import { AssessorFacade } from '../../../store/assessor.facade';
import { map } from 'rxjs';
import { CommentsSummaryComponent } from '../../../components/review-decision/pages/comments-summary/comments-summary.component';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Component({
  selector: 'app-assessor-confirm-rejection-submit-to-confirm-rejection',
  standalone: true,
  templateUrl: './assessor-confirm-rejection-submit-to-confirm-rejection.component.html',
  styleUrls: ['./assessor-confirm-rejection-submit-to-confirm-rejection.component.scss'],
  imports: [CommonModule, RouterModule, CommentsSummaryComponent],
})
export class AssessorSubmitToConfirmRejectionComponent {
  basePath$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}`;
    })
  );
  comments$ = this.assessorFacade.sharedFacade.stateObservables.comments$;

  // UI Translations for the page
  copy = confirmRejectionCopy.screen1;

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
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.confirmRejection.selectSecondAssessor}`], {
      relativeTo: this.route,
    });
  }
}
