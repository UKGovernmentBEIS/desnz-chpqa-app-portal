import { Component } from '@angular/core';
import { returnSchemeCopy } from '../../../config/assessor-web-copy.config';
import { CommentsSummaryComponent } from '../../../components/review-decision/pages/comments-summary/comments-summary.component';
import { AssessorFacade } from '../../../store/assessor.facade';
import { RemoteDataModule } from 'ngx-remotedata';
import { CommonModule } from '@angular/common';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { map } from 'rxjs';

@Component({
  selector: 'app-assessor-return-to-rp-comments-to-rp',
  standalone: true,
  templateUrl: './assessor-return-to-rp-comments-to-rp.component.html',
  styleUrls: ['./assessor-return-to-rp-comments-to-rp.component.scss'],
  imports: [CommonModule, CommentsSummaryComponent, RemoteDataModule],
})
export class AssessorReturnToRPComponent {
  copy = returnSchemeCopy;

  basePath$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}`;
    })
  );

  commnets$ = this.assessorFacade.sharedFacade.stateObservables.comments$;
  isComponentAlive = true;

  constructor(
    private assessorFacade: AssessorFacade,
    private store: Store
  ) {}

  ngOnInit() {
    this.assessorFacade.showLoadingSpinnerForApiResponses(this.commnets$ as any, this.isComponentAlive);
    this.assessorFacade.submitAssessmentReturnToRPFacade.dispatchActions.load();
  }

  onSubmit() {
    this.assessorFacade.submitAssessmentReturnToRPFacade.dispatchActions.submitReturnToRP();
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
