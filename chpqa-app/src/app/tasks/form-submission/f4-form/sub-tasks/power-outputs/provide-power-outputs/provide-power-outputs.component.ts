import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { PerfomanceSummaryListComponent } from '@shared/components/perfomance-summary-list/perfomance-summary-list.component';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { AssessorReviewDecisionFormInfo, AssessorReviewDecisionFormSubmitData } from '@shared/models';
import { NavigationService } from '@shared/services/navigation.service';
import { selectIsSubmissionNonEditable, selectSelectedScheme, SharedFacade } from '@shared/store';
import { combineLatest, Observable, of, switchMap, take } from 'rxjs';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { fetchPowerOutputs } from 'src/app/tasks/form-submission/store';
import { isComplex } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ReviewDecisionFormComponent } from "../../../../../../features/assessor/components/review-decision/pages/review-decision-form/review-decision-form.component";
import { DynamicFormErrorsSummaryComponent } from "../../../../../../shared/components/dynamic-form-builder/components/dynamic-form-errors-summary/dynamic-form-errors-summary.component";
import { PowerOutput } from '../../../models/f4-form.model';
import { selectPowerOutputs, selectPowerOutputsStatus, selectTotalPowerOutputs, setPowerOutput, submitPowerOutputs } from '../../../store';

@Component({
  selector: 'app-provide-power-outputs',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RouterModule, PerfomanceSummaryListComponent, DynamicFormErrorsSummaryComponent, ReviewAnswersComponent, ReviewDecisionFormComponent],
  templateUrl: './provide-power-outputs.component.html',
  styleUrl: './provide-power-outputs.component.scss',
})
export class ProvidePowerOutputsComponent implements OnInit {
  backButton = `../${FormSubmissionPath.TASK_LIST}`;
  arePowerOutputsCompleted$ = this.store.pipe(select(selectPowerOutputsStatus));
  totalPowerOutputs$ = this.store.pipe(select(selectTotalPowerOutputs));
  isComplex$ = this.store.pipe(select(isComplex));
  selectedScheme$: Observable<ReplyScheme> = this.store.select(selectSelectedScheme);
  powerOutputs$: Observable<PowerOutput[] | void> = this.store.pipe(
    select(selectPowerOutputs),
    switchMap(powerOutputs => {
      if (!powerOutputs || powerOutputs.length === 0) {
        return of(this.store.dispatch(fetchPowerOutputs()));
      }
      return of(powerOutputs);
    })
  );
  isSubmittedOrInReview: boolean;
  isComponentAlive = true;
  formHeader: string = '';

  isUserAnAssessor: boolean;
  assessorForm: FormGroup;
  assessorFormUpdated: boolean;
  assessorFormValidationMessages: unknown;

  constructor(
    private readonly store: Store,
    private readonly navigationService: NavigationService,
    private sharedFacade: SharedFacade,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([this.store
      .select(selectIsSubmissionNonEditable), this.sharedFacade.isUserAnAssessor()])

      .pipe(take(1))
      .subscribe(([nonEditable, isUserAnAssessor]) => {
        this.isSubmittedOrInReview = nonEditable;
        this.isUserAnAssessor = isUserAnAssessor;
      });
      this.setFormHeader();
  }

  handleChange(event: any): void {
    this.store.dispatch(setPowerOutput({ index: event.index, powerOutput: event.value }));
  }

  submit(): void {
    if (this.isSubmittedOrInReview) {
      this.navigationService.navigateToTaskList();
    } else {
      this.store.dispatch(submitPowerOutputs());
    }
  }

  handleAssessorFormInfo(event: AssessorReviewDecisionFormInfo) {
    this.assessorForm = event?.assessorForm;
    this.assessorFormUpdated = event?.assessorFormUpdated;
    this.assessorFormValidationMessages = event?.assessorFormValidationMessages;

    this.cdRef.detectChanges();
  }

  handleAssessorFormSubmission(event: AssessorReviewDecisionFormSubmitData) {
    this.sharedFacade.handleAssessorFormSubmission(event);
  }

  private setFormHeader(): void {
    if (this.isUserAnAssessor) {
      this.formHeader = 'Review power outputs';
    } else {
      this.formHeader = 'Provide your power outputs';
    }
  }
}
