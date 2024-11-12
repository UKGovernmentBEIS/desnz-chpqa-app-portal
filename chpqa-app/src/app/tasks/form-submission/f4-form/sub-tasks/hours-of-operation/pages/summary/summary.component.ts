import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { HoursOfOperationFacade } from '../../state/hours-of-operation.facade';
import { combineLatest, first, map, Observable, take } from 'rxjs';
import { HoursOfOperationService } from '../../services/hours-of-operation.service';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { Status } from '@shared/enums/status.enum';
import { select, Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { selectFormSubmissionType, selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  providers: [HoursOfOperationFacade, HoursOfOperationService],
})
export class SummaryComponent {
  reviewScreenValues: ReviewFieldConfig[] = [];
  hoursOfOperationData$ = this.hoursOfOperationFacade.selectHoursOfOperation$;
  submissionForm$ = this.hoursOfOperationFacade.submissionForm$;
  hoursOfOperationFormInputs$ = this.hoursOfOperationFacade.hoursOfOperationFormInputs$;
  hoursOfOperationSectionStatus$ = this.hoursOfOperationFacade.sectionStatus$;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.ProvideHoursOfOperation)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION}`;
      }
    })
  );

  nonEditableSubmission$ = this.sharedFacade.isSubmissionNonEditable();

  constructor(
    private hoursOfOperationFacade: HoursOfOperationFacade,
    private hoursOfOperationService: HoursOfOperationService,
    private ngxSpinner: NgxSpinnerService,
    private readonly store: Store,
    private sharedFacade: SharedFacade,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.loadHoursOfOperationDataForReview();
    this.setFormHeader();
  }

  loadHoursOfOperationDataForReview(): void {
    this.ngxSpinner.show();

    combineLatest([this.hoursOfOperationFormInputs$, this.submissionForm$, this.store.select(selectFormSubmissionType)])
      .pipe(first())
      .subscribe(([formInputs, submissionForm, submissionFormType]) => {
        const hoursOfOperation = formInputs ? formInputs : submissionForm;
        this.hoursOfOperationFacade.setHoursOfOperationState(hoursOfOperation);
        this.reviewScreenValues = this.hoursOfOperationService.generateHoursOfOperationFieldConfigs(hoursOfOperation, formInputs, null, submissionFormType);
        this.ngxSpinner.hide();
      });
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review hours of operation';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  handleFormSubmitted(event: any): void {
    this.nonEditableSubmission$.pipe(take(1)).subscribe(isSubmissionNonEditable => {
      isSubmissionNonEditable
      ? this.navigationService.navigateToTaskList()
      : this.hoursOfOperationFacade.submitHoursOfOperation();
    })
  }
}
