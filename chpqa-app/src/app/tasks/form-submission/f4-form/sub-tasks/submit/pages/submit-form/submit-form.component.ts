import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { map, Observable, Subject, take } from 'rxjs';
import { GovukCheckboxInputComponent } from '@shared/components/form-controls/govuk-checkbox-input/govuk-checkbox-input.component';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { SubmitToAssessorFacade } from '../../state/submit-to-assessor.facade';
import { SubmitToAssessorService } from '../../services/submit-to-assessor.service';
import { Status } from '@shared/enums/status.enum';
import { WEB_COPY_SUBMIT_FORM } from '../../config/submit.web-copy';
import { VALIDATIONS_SUBMIT } from '../../config/submit.validations';
import { Title } from '@angular/platform-browser';
import { RemoteData } from 'ngx-remotedata';
import { UpdSubmtoAssessorClass } from 'src/app/api-services/chpqa-api/generated';
import { HttpErrorResponse } from '@angular/common/http';
import { FormErrorDirective } from '@shared/directives/form-error.directive';

@Component({
  selector: 'app-submit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GovukCheckboxInputComponent, DynamicFormErrorsSummaryComponent, FormErrorDirective],
  templateUrl: './submit-form.component.html',
  styleUrl: './submit-form.component.scss',
  providers: [SubmitToAssessorFacade, SubmitToAssessorService, FormGroupDirective],
})
export class SubmitFormComponent implements OnInit, OnDestroy {
  webCopy = WEB_COPY_SUBMIT_FORM;
  apiUpdateSubmitToAssessorPost$: Observable<RemoteData<UpdSubmtoAssessorClass, HttpErrorResponse>> =
    this.submitToAssessorFacade.apiUpdateSubmitToAssessorPost$;
  formUpdated = false;

  submitToAssessorSectionStatus$ = this.submitToAssessorFacade.submitToAssessorSectionStatus$;
  backButton$: Observable<string> = this.submitToAssessorSectionStatus$.pipe(
    map(status => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.TASK_LIST}`; //TODO fix
      }
    })
  );
  form: FormGroup = this.submitToAssessorService.createSubmitForm();

  validationMessages = VALIDATIONS_SUBMIT;

  formInputs = [
    {
      label: 'I agree to the statements above',
      controlName: 'statements',
      validationMessages: this.validationMessages.statements,
    },
  ];

  StatusEnum = Status;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private submitToAssessorFacade: SubmitToAssessorFacade,
    private submitToAssessorService: SubmitToAssessorService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.setPageTitle(this.webCopy.caption);
    this.registerLoadingSpinnerForApiResponses();
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitToAssessorService
        .createPayloadToSubmit()
        .pipe(take(1))
        .subscribe(payload => {
          this.submitToAssessorFacade.submitToAssessor(payload);
        });
    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      this.formUpdated = true;
    }
  }

  private registerLoadingSpinnerForApiResponses(): void {
    this.submitToAssessorFacade.showLoadingSpinnerForApiResponses([this.apiUpdateSubmitToAssessorPost$], this.unsubscribe$);
  }

  private setPageTitle(pageTitle: string): void {
    this.titleService.setTitle(pageTitle);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
