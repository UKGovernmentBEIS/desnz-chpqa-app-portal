import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, combineLatest, first, map, take } from 'rxjs';
import { SummaryComponent } from 'src/app/tasks/form-submission/components/summary/summary.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { f2FormFeature, setTotalPowerCapacityUnderMaxHeat, submitTotalPowerCapacityUnderMaxHeat } from '../../../../store';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';

@Component({
  selector: 'app-summary-scheme-line-diagram',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, NgIf, AsyncPipe, SummaryComponent, ReviewAnswersComponent],
})
export class TotalPowerCapacityUnderMaxHeatSummaryComponent {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.ProvideCondensingStreamTurbineDetails)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.SET_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;
  nonEditableSubmission$ = this.sharedFacade.isSubmissionNonEditable();
  formHeader!: string;

  constructor(
    private readonly store: Store,
    private route: ActivatedRoute,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade,
    private navigationService: NavigationService
  ) {
    this.ngxSpinner.show();
    combineLatest([
      this.store.select(f2FormFeature.selectTotalPowerCapacityUnderMaxHeat),
      this.store.select(selectSubmissionForm),
      this.store.select(selectSectionStatus(SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions)),
      this.sharedFacade.isUserAnAssessor(),
    ])
      .pipe(first())
      .subscribe(([totalPowerCapacityUnderMaxHeat, submissionForm, sectionStatus, isAssessor]) => {
        this.sectionStatus = sectionStatus;

        if (this.sectionStatus === Status.Completed && !totalPowerCapacityUnderMaxHeat) {
          this.store.dispatch(
            setTotalPowerCapacityUnderMaxHeat({
              totalPowerCapacityUnderMaxHeat: submissionForm.totalPowCapUnderMaxHeatConds,
            })
          );
        }
        const reviewScreensPayload = totalPowerCapacityUnderMaxHeat ?? submissionForm?.totalPowCapUnderMaxHeatConds;
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(reviewScreensPayload);

        this.setFormHeader(isAssessor);

        this.ngxSpinner.hide();
      });
  }

  private setFormHeader(isAssessor: boolean) {
    this.formHeader = isAssessor ? 'Review total power capacity under MaxHeat conditions' : 'Check your answers';
  }

  private generateReviewYourAnswersFieldConfigs(totalPowerCapacityUnderMaxHeat: any): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId']; // Assuming 'submissionFormId' is another route param
    const inputLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.SET_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS}`;
    const reviewScreenValues: ReviewFieldConfig[] = [
      {
        name: 'totalPowerCapacityUnderMaxHeat',
        label: 'Total power capacity under MaxHeat conditions',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: totalPowerCapacityUnderMaxHeat.toString(),
        ariaLabel: ChangeLinkAriaLabel.TOTAL_POWER_CAPACITY_UNDER_MAX_HEAT,
      },
    ];
    return reviewScreenValues;
  }

  handleFormSubmitted(): void {
    this.nonEditableSubmission$.pipe(take(1)).subscribe(isSubmissionNonEditable => {
      isSubmissionNonEditable ? this.navigationService.navigateToTaskList() : this.store.dispatch(submitTotalPowerCapacityUnderMaxHeat());
    });
  }
}
