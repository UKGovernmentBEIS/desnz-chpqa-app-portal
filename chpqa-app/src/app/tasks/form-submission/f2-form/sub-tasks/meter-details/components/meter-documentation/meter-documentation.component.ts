import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { GovukFileInputListComponent } from '@shared/components/form-controls/govuk-file-input-list/govuk-file-input-list.component';
import { GovukFileInputComponent } from '@shared/components/form-controls/govuk-file-input/govuk-file-input.component';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { Store } from '@ngrx/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { setMeterDocumentation } from '../../store/meter.actions';
import { selectMeterDocumentation } from '../../store/meter.selectors';
import { first, Subscription } from 'rxjs';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { FILE_VALIDATION_MESSAGES, fileSizeValidator, fileTypeValidator, maxFilesValidator } from '@shared/utils/validators-utils';
import { FileWithId } from '@shared/models/file-with-id.model';

@Component({
  selector: 'app-meter-documentation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GovukFileInputComponent,
    GovukTextareaInputComponent,
    GovukFileInputListComponent,
    DynamicFormErrorsSummaryComponent,
  ],
  templateUrl: './meter-documentation.component.html',
  styleUrl: './meter-documentation.component.scss',
})
export class MeterDocumentationComponent implements OnInit {
  BACK = `${FormSubmissionPath.BASE_PATH}/${FormSubmissionPath.METER_OUTPUT_RANGE}`;
  form: FormGroup;
  files: FileWithId[] = [];
  formUpdated = false;
  validationMessages = FILE_VALIDATION_MESSAGES;
  private deletedFileIds: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private location: Location
  ) {
    this.form = this.fb.group({
      files: [[], [fileTypeValidator(), maxFilesValidator(25), fileSizeValidator(50)]],
      comments: [null, []],
    });
  }

  ngOnInit(): void {
    this.store
      .select(selectMeterDocumentation)
      .pipe(first())
      .subscribe(documentation => {
        this.files = documentation.files ? documentation.files : [];
        this.form.patchValue({
          comments: documentation.comments,
          files: documentation.files ? documentation.files.map((fileWithId: FileWithId) => fileWithId.file) : [],
        });
      });
  }

  onFileAdded(newFiles: File[]) {
    const filesControl = this.form.get('files');
    if (filesControl) {
      const mergedFiles = this.files.map(fileWithId => fileWithId.file);
      newFiles.forEach(newFile => {
        const exists = mergedFiles.some(file => file.name === newFile.name && file.size === newFile.size && file.lastModified === newFile.lastModified);

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
      console.error(`File with id ${event.id} not found.`);
    }
  }

  onContinue() {
    if (this.form.valid) {
      this.store.dispatch(
        setMeterDocumentation({
          documentation: {
            files: this.files,
            comments: this.form.getRawValue().comments,
            deletedFileIds: this.deletedFileIds,
          },
        })
      );
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  goBack(): void {
    this.location.back();
  }
}
