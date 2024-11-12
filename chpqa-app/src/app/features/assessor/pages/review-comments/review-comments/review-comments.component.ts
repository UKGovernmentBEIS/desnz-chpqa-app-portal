import { Component, OnDestroy, OnInit } from '@angular/core';
import { reviewCommentsWebCopy } from '../../../config/assessor-web-copy.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { CommentsSummaryComponent } from "../../../components/review-decision/pages/comments-summary/comments-summary.component";
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId, SharedFacade } from '@shared/store';
import {  map} from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { AssessorSelectors } from '../../../store/assessor.selectors';

@Component({
  selector: 'app-review-comments',
  standalone: true,
  imports: [CommonModule, CommentsSummaryComponent],
  templateUrl: './review-comments.component.html',
  styleUrl: './review-comments.component.scss'
})
export class ReviewCommentsComponent implements OnInit, OnDestroy {
  basePath$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}`;
    })
  );
  comments$ = this.assessorFacade.sharedFacade.stateObservables.comments$;
  assessorName$ = this.store.select(AssessorSelectors.AssessorDashboardSelectors.selectAssessorInititalsBySchemeId);
  // UI Translations for the page
  copy = reviewCommentsWebCopy;

  isComponentAlive = true;
  selectLatestSubmissionStatus$ = this.sharedFacade.selectLatestSubmissionStatus$;
  
  constructor(
    private readonly store: Store,
    private assessorFacade: AssessorFacade,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  onContinue() {
    this.assessorFacade.submitReviewedCommentsFacade.dispatchActions.submit();
  }
}


