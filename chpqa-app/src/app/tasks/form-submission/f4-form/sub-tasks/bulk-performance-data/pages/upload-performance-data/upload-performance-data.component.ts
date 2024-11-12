import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormGroupDirective } from '@angular/forms';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { RouterModule } from '@angular/router';
import { GovukSingleFileInputComponent } from '@shared/components/form-controls/govuk-single-file-input/govuk-single-file-input.component';
import { Subject, take, tap } from 'rxjs';
import { PerformanceDataService } from '../../services/performance-data.service';
import { WEB_COPY_BULK_PERFORMANCE_DATA_UPLOAD } from '../../config/bulk-performance-data.web-copy';
import { isFailure, RemoteDataModule } from 'ngx-remotedata';
import { BulkPerformanceDataFacade } from '../../state/bulk-performance-data.facade';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { VALIDATIONS_BULK_PERFORMANCE_DATA_UPLOAD } from '../../config/bulk-performance-data.validations';

@Component({
  selector: 'app-upload-performance-data',
  standalone: true,
  templateUrl: './upload-performance-data.component.html',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormErrorDirective,
    GovukSingleFileInputComponent,
    RemoteDataModule,
    DynamicFormErrorsSummaryComponent,
  ],
  providers: [BulkPerformanceDataFacade, FormGroupDirective],
})
export class UploadPerformanceDataComponent implements OnDestroy, OnInit {
  @ViewChild(DynamicFormErrorsSummaryComponent)
  dynamicFormErrorsSummaryComponent: DynamicFormErrorsSummaryComponent;

  webCopy = WEB_COPY_BULK_PERFORMANCE_DATA_UPLOAD;
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  validationMessages = VALIDATIONS_BULK_PERFORMANCE_DATA_UPLOAD;

  templateUrl$ = this.performanceDataService.getTemplateFileLocation();
  templateFileName$ = this.performanceDataService.getTemplateFileName();
  form: FormGroup = this.performanceDataService.createUploadForm();
  formUpdated = false;
  fileFormControlName = this.performanceDataService.getFileFormControlName();
  loadSelectedFile$ = this.performanceDataService.getSelectedFile();

  apiValidateFilesPost$ = this.bulkPerformanceDataFacade.apiValidateFilePost$.pipe(
    tap(response => {
      if (isFailure(response)) {
        this.handleValidationError(response.error.message);
      }
    })
  );
  
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bulkPerformanceDataFacade: BulkPerformanceDataFacade,
    private performanceDataService: PerformanceDataService
  ) {}

  ngOnInit() {
    this.registerLoadingSpinnerForApiResponses();
  }

  private registerLoadingSpinnerForApiResponses(): void {
    this.bulkPerformanceDataFacade.showLoadingSpinnerForApiResponses([this.apiValidateFilesPost$], this.unsubscribe$);
  }

  onContinue() {
    if (this.form.valid) {
      const hasFilesToUpload = this.performanceDataService.checkFileToUpload(this.form);
      if (hasFilesToUpload) {
        this.performanceDataService.submitValidatePerformanceDataFile(this.form).pipe(take(1)).subscribe();
      }
    } else {
      this.markFormAsTouched();
    }
  }

  handleValidationError(errorMessage: string) {
    this.validationMessages.file.validationError = errorMessage;
    this.dynamicFormErrorsSummaryComponent.addControlError('file', 'validationError', errorMessage);
    this.markFormAsTouched();
  }

  markFormAsTouched() {
    this.form.markAllAsTouched();
    this.formUpdated = true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  
}
