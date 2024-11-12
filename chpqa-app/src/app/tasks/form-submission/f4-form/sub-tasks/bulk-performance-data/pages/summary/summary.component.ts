import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { first, Subject, take } from 'rxjs';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { BulkPerformanceDataFacade } from '../../state/bulk-performance-data.facade';
import { PerformanceDataService } from '../../services/performance-data.service';
import { Status } from '@shared/enums/status.enum';
import { RemoteDataModule } from 'ngx-remotedata';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Component({
  selector: 'app-upload-performance-data-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  imports: [CommonModule, ReviewAnswersComponent, RemoteDataModule],
  providers: [BulkPerformanceDataFacade],
})
export class UploadPerformanceDataSummaryComponent implements OnInit, OnDestroy {
  backButton = `../${FormSubmissionPath.UPLOAD_PERFORMANCE_DATA}`;
  reviewScreenValues: ReviewFieldConfig[] = [];

  selectPerformanceDataFile$ = this.bulkPerformanceDataFacade.selectPerformanceDataFile$;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private bulkPerformanceDataFacade: BulkPerformanceDataFacade,
    private performanceDataService: PerformanceDataService
  ) {}

  ngOnInit() {
    this.loadDataForReview();
  }

  loadDataForReview(): void {
    this.selectPerformanceDataFile$.pipe(first()).subscribe(performanceDataFile => {
      this.reviewScreenValues = this.performanceDataService.generateReviewYourAnswersFieldConfigs(performanceDataFile);
    });
  }

  handleFormSubmitted(status: Status): void {
    this.performanceDataService.submitBulkPerformanceDataUpload().pipe(take(1)).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
