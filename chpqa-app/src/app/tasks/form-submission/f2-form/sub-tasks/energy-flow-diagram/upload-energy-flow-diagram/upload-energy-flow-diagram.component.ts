import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { GovukFileInputComponent } from '@shared/components/form-controls/govuk-file-input/govuk-file-input.component';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { GovukFileInputListComponent } from '@shared/components/form-controls/govuk-file-input-list/govuk-file-input-list.component';
import { setEnergyFlow } from '../../../store/f2-form.actions';
import { first } from 'rxjs';
import { f2FormFeature } from '../../../store';
import { fileSizeValidator, fileTypeValidator, FILE_VALIDATION_MESSAGES, maxFilesValidator } from '@shared/utils/validators-utils';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { FileWithId } from '@shared/models/file-with-id.model';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Component({
  selector: 'app-energy-flow-diagram',
  standalone: true,
  templateUrl: './upload-energy-flow-diagram.component.html',
  styleUrl: './upload-energy-flow-diagram.component.scss',
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
export class UploadEnergyFlowDiagramComponent implements OnInit {
  form: FormGroup;
  files: FileWithId[] = [];
  energyFlow$ = this.store.select(f2FormFeature.selectEnergyFlow);
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
      files: [[], [Validators.required, fileTypeValidator(), maxFilesValidator(25), fileSizeValidator(50)]],
      comments: [''],
    });
  }

  ngOnInit(): void {
    this.store
      .select(f2FormFeature.selectEnergyFlow)
      .pipe(first())
      .subscribe(energyFlow => {
        this.files = energyFlow.files ? [...energyFlow.files] : [];
        this.form.patchValue({
          files: energyFlow.files.map((fileWithId: FileWithId) => fileWithId.file),
          comments: energyFlow.comments,
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
        setEnergyFlow({
          energyFlow: {
            files: this.files,
            comments: this.form.getRawValue().comments,
            deletedFileIds: this.deletedFileIds,
          },
        })
      );
      this.router.navigate([`../${FormSubmissionPath.ENERGY_FLOW_DIAGRAM_SUMMARY}`], {
        relativeTo: this.route,
      });
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }
}
