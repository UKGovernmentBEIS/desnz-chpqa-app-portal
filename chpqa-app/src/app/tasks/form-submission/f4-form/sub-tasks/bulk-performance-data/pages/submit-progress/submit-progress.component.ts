import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { BulkPerformanceDataFacade } from '../../state/bulk-performance-data.facade';
import { RemoteDataModule } from 'ngx-remotedata';
import {
  WEB_COPY_BULK_PERFORMANCE_DATA_SUBMIT_COMPLETED,
  WEB_COPY_BULK_PERFORMANCE_DATA_SUBMIT_IN_PROGRESS,
} from '../../config/bulk-performance-data.web-copy';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Component({
  selector: 'app-submit-progress',
  standalone: true,
  templateUrl: './submit-progress.component.html',
  imports: [CommonModule, ReviewAnswersComponent, RemoteDataModule],
  providers: [BulkPerformanceDataFacade],
})
export class UploadPerformanceDataSubmitComponent implements OnInit, OnDestroy {
  webCopyInProgress = WEB_COPY_BULK_PERFORMANCE_DATA_SUBMIT_IN_PROGRESS;
  webCopyCompleted = WEB_COPY_BULK_PERFORMANCE_DATA_SUBMIT_COMPLETED;
  
  apiUploadFilePost$ = this.bulkPerformanceDataFacade.apiUploadFilePost$;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private bulkPerformanceDataFacade: BulkPerformanceDataFacade,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerLoadingSpinnerForApiResponses();
  }

  onContinue() {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
      skipLocationChange: true,
    });
  }

  private registerLoadingSpinnerForApiResponses(): void {
    this.bulkPerformanceDataFacade.showLoadingSpinnerForApiResponses([this.apiUploadFilePost$], this.unsubscribe$);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
