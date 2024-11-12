import { Injectable } from '@angular/core';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, combineLatest, first, map, Observable, of, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { BulkPerformanceDataActions } from '../state/bulk-performance-data.actions';
import { selectSubmissionFormId } from '@shared/store';
import { isComplex, selectFormSubmissionType } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ActivatedRoute } from '@angular/router';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { BulkPerformanceDataSelectors } from '../state/bulk-performance-data.selectors';
import { fileTypeValidator } from '@shared/utils/validators-utils';
import { FileTypes } from '@shared/enums/file-type.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { FileWithId } from '@shared/models/file-with-id.model';

@Injectable({ providedIn: 'root' })
export class PerformanceDataService {
  private fileFormControlName = 'file';

  constructor(
    private chpqaApiService: ChqpaApiServiceWrapper,
    private fb: FormBuilder,
    private store: Store<any>,
    private route: ActivatedRoute
  ) {}

  getFileFormControlName() {
    return this.fileFormControlName;
  }

  getTemplateFileLocation(): Observable<string> {
    return this.store.select(selectFormSubmissionType).pipe(
      map(formSubmissionType => {
        return formSubmissionType === SubmissionFormType.F4s
          ? 'assets/files/simple_scheme_bulk_upload_template.xlsx'
          : 'assets/files/complex_scheme_bulk_upload_template.xlsx';
      })
    );
  }

  getTemplateFileName(): Observable<string> {
    return this.store.select(selectFormSubmissionType).pipe(
      map(formSubmissionType => {
        return formSubmissionType === SubmissionFormType.F4s
          ? 'simple_scheme_bulk_upload_template.xlsx'
          : 'complex_scheme_bulk_upload_template.xlsx';
      })
    );
  }

  getSelectedFile() {
    return this.store.select(BulkPerformanceDataSelectors.selectPerformanceDataFile);
  }

  generateReviewYourAnswersFieldConfigs(document: File): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId']; // Assuming 'submissionFormId' is another route param
    const uploadLink = `/${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.UPLOAD_PERFORMANCE_DATA}`;

    const fileWithId: FileWithId = {
      file: document
    };

    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: 'Performance spreadsheet',
      type: 'file',
      value: [fileWithId],
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.PERFORMANCE_DATA_DOCUMENTS,
      showChangeLink: true
    };

    return [aggregatedDocumentsField];
  }

  submitBulkPerformanceDataUpload() {
    this.store.dispatch(BulkPerformanceDataActions.submitBulkPerformanceDataUpload());

    const payloads$ = this.createPayloadToSubmitBulkPerformanceDataUpload();
    const isComplex$ = this.store.select(isComplex);

    return combineLatest([payloads$, isComplex$]).pipe(
      switchMap(([payloads, isComplex]) => {
        const apiEndPoint = isComplex
          ? this.chpqaApiService.bulkImportf4cService.apiSecureBulkImportf4cPost(payloads.submissionId, payloads.file)
          : this.chpqaApiService.bulkImportf4sService.apiSecureBulkImportf4sPost(payloads.submissionId, payloads.file);

        return apiEndPoint.pipe(
          map(response => {
            // Dispatch success action with the response
            this.store.dispatch(
              BulkPerformanceDataActions.submitBulkPerformanceDataUploadSuccess({
                response,
              })
            );
            return response;
          }),
          catchError(error => {
            // Dispatch failure action with the error
            this.store.dispatch(BulkPerformanceDataActions.submitBulkPerformanceDataUploadFailure({ error }));
            return of(error);
          })
        );
      })
    );
  }

  createPayloadToSubmitBulkPerformanceDataUpload(): Observable<any> {
    return combineLatest([this.store.select(selectSubmissionFormId), this.store.select(BulkPerformanceDataSelectors.selectPerformanceDataFile)]).pipe(
      first(),
      map(([submissionId, file]) => ({
        submissionId,
        file,
      }))
    );
  }

  createUploadForm(): FormGroup {
    return this.fb.group({
      file: [null, [Validators.required, fileTypeValidator([FileTypes.xls, FileTypes.xlsx])]],
    });
  }

  checkFileToUpload(form: FormGroup): boolean {
    const filesControl = form.get(this.fileFormControlName);
    return filesControl && filesControl.value;
  }

  submitValidatePerformanceDataFile(form: FormGroup) {
    this.store.dispatch(BulkPerformanceDataActions.submitBulkPerformanceDataFileValidate());

    const file = form.getRawValue().file;
    const payloads$ = this.createPayloadToSubmitValidatePerformanceDataFile(file);
    const isComplex$ = this.store.select(isComplex);

    return combineLatest([payloads$, isComplex$]).pipe(
      switchMap(([payloads, isComplex]) => {
        const apiEndPoint = isComplex
          ? this.chpqaApiService.validateImportf4cService.apiSecureValidateImportf4cPost(payloads.submissionId, payloads.file)
          : this.chpqaApiService.validateImportf4sService.apiSecureValidateImportf4sPost(payloads.submissionId, payloads.file);

        return apiEndPoint.pipe(
          map(response => {
            // Dispatch success action with the response
            this.store.dispatch(
              BulkPerformanceDataActions.submitBulkPerformanceDataFileValidateSuccess({
                response,
                performanceDataFile: file,
              })
            );
            return response;
          }),
          catchError((error: Error) => {
            // Dispatch failure action with the error
            this.store.dispatch(BulkPerformanceDataActions.submitBulkPerformanceDataFileValidateFailure({ error }));
            return of(error);
          })
        );
      })
    );
  }

  createPayloadToSubmitValidatePerformanceDataFile(file: File) {
    return this.store.select(selectSubmissionFormId).pipe(
      first(),
      map(submissionId => ({
        submissionId,
        file,
      }))
    );
  }
}
