import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukFileInputListComponent } from '@shared/components/form-controls/govuk-file-input-list/govuk-file-input-list.component';
import { GovukFileInputComponent } from '@shared/components/form-controls/govuk-file-input/govuk-file-input.component';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { FileWithId } from '@shared/models/file-with-id.model';
import { FILE_VALIDATION_MESSAGES, fileSizeValidator, fileTypeValidator, maxFilesValidator } from '@shared/utils/validators-utils';
import { first } from 'rxjs/operators';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { WEB_COPY_ADJUSTMENT_FACTORS_UPLOAD } from '../../config/uncertainty-factors.web-copy';
import { setUncertaintyFactorsUploadedDocuments } from '../../state/uncertainty-factors.actions';
import { UncertaintyFactorsSelectors } from '../../state/uncertainty-factors.selectors';

@Component({
  selector: 'app-adjustment-factors-upload',
  standalone: true,
  templateUrl: './adjustment-factors-upload.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukFileInputComponent,
    GovukTextareaInputComponent,
    GovukFileInputListComponent,
    DynamicFormErrorsSummaryComponent,
  ],
})
export class AdjustmentFactorsUploadComponent implements OnInit {
  form: FormGroup;
  files: FileWithId[] = [];
  webCopy = WEB_COPY_ADJUSTMENT_FACTORS_UPLOAD;
  uncertaintyFactorsUploadedDocuments$ = this.store.select(UncertaintyFactorsSelectors.selectUncertaintyFactorsUploadedDocuments);
  formUpdated = false;
  validationMessages = FILE_VALIDATION_MESSAGES;
  private deletedFileIds: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private location: Location,
    private readonly store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      files: [[], [fileTypeValidator(), maxFilesValidator(25), fileSizeValidator(50)]],
      comments: ['', [Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    this.store
      .select(UncertaintyFactorsSelectors.selectUncertaintyFactorsUploadedDocuments)
      .pipe(first())
      .subscribe(uncertaintyFactorsUploadedDocuments => {
        this.files = uncertaintyFactorsUploadedDocuments.files ? [...uncertaintyFactorsUploadedDocuments.files] : [];
        this.form.patchValue({
          files: uncertaintyFactorsUploadedDocuments.files.map((fileWithId: FileWithId) => fileWithId.file),
          comments: uncertaintyFactorsUploadedDocuments.comments,
        });
      });
  }

  goBack(): void {
    this.location.back();
  }

  onFileAdded(newFiles: File[]) {
    const filesControl = this.form.get('files');
    if (filesControl) {
      const mergedFiles = this.files.map(fileWithId => fileWithId.file);
      newFiles.forEach(newFile => {
        const exists = mergedFiles.some(file => file.name === newFile.name);

        if (!exists) {
          mergedFiles.push(newFile);
          this.files = [...this.files, { file: newFile, id: null }];
        }
      });
      this.form.patchValue({
        files: mergedFiles,
      });
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
    }
  }


  deleteFile(event: { id: string; fileIndex: number }) {
    if (event.fileIndex !== -1) {
      const newFiles = [...this.files];
      const deletedFile = newFiles.splice(event.fileIndex, 1)[0];
      this.form.patchValue({
        files: newFiles.map((fileWithId: FileWithId) => fileWithId.file),
      });
      if (deletedFile.id) {
        this.deletedFileIds.push(deletedFile.id);
      }
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.files = [...newFiles];
    } else {
      console.error(`File not found.`);
    }
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setUncertaintyFactorsUploadedDocuments({
          uncertaintyFactorsUploadedDocuments: {
            files: this.files,
            comments: this.form.getRawValue().comments,
            deletedFileIds: this.deletedFileIds,
          },
        })
      );
      this.router.navigate([`../${FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_SUMMARY}`], {
        relativeTo: this.route,
      });
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
