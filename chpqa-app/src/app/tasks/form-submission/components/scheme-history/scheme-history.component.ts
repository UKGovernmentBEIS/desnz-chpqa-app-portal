import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId, SharedFacade } from '@shared/store';
import { Observable, take, takeWhile } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { SchemeHistoryFacade } from './store/scheme-history.facade';
import { HttpErrorResponse } from '@angular/common/http';
import { RemoteData, isSuccess } from 'ngx-remotedata';
import { ReplySubmissionHistory } from 'src/app/api-services/chpqa-api/generated';
import { AssessmentOutcomeLabelPipe } from '@shared/pipes/assessment-outcome.pipe';

@Component({
  selector: 'app-scheme-history',
  standalone: true,
  templateUrl: './scheme-history.component.html',
  styleUrls: ['./scheme-history.component.scss'],
  imports: [RouterLink, CommonModule, AssessmentOutcomeLabelPipe]
})
export class SchemeHistoryComponent implements OnDestroy {
  schemeHistoryResponse$: Observable<RemoteData<ReplySubmissionHistory[], HttpErrorResponse>> = this.schemeHistoryFacade.schemeHistoryFacade.stateObservables.response$;
  history: ReplySubmissionHistory[] = [];

  private submissionId: string = null;
  private isComponentAlive = true;

  constructor(
    private router: Router,
    private sharedFacade: SharedFacade,
    private store: Store,
    private schemeHistoryFacade: SchemeHistoryFacade
  ) {
    this.store
      .select(selectSubmissionFormId)
      .pipe(take(1))
      .subscribe({
        next: submissionId => {
          this.submissionId = submissionId;
        },
      });
  }

  viewYearDetails(item: ReplySubmissionHistory) {
    const yearDetailsRoute = `${FormSubmissionPath.BASE_PATH}/${item.id}/task-list` || '#';
    this.router.navigate([yearDetailsRoute]);
  }

  goBack(): void {
    const schemeDetailsRoute = `${FormSubmissionPath.BASE_PATH}/${this.submissionId}/task-list` || '#';
    this.router.navigate([schemeDetailsRoute]);
  }

  onDownloadFile(fileId: string | undefined, fileName: string): void {
    if (fileId) {
      this.sharedFacade.downloadFile(fileId, fileName);
    }
  }

  ngOnInit(): void {
    this.handleSchemeHistoryApiResponse();
    this.schemeHistoryFacade.showLoadingSpinnerForApiResponses(this.schemeHistoryResponse$ as any, this.isComponentAlive);
    this.schemeHistoryFacade.schemeHistoryFacade.dispatchActions.loadSchemeHistoryData();
  }

  private handleSchemeHistoryApiResponse(): void {
    this.schemeHistoryResponse$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(response => {
      if (isSuccess(response)) {
        const responseValue = (response as any)?.value;
        this.history = responseValue;
      }
    });
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
