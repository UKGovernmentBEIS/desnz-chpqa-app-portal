import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { NavigationService } from '@shared/services/navigation.service';
import { SharedFacade } from '@shared/store';
import { combineLatest, first, map, Observable, Subject, take, takeWhile } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { HeatRejectionFacilityService } from '../../services/heat-rejection-facility.service';
import { HeatRejectionFacilityFacade } from '../../state/heat-rejection-facility.facade';

@Component({
  selector: 'app-heat-rejection-facility-review',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RouterModule, ReviewAnswersComponent],
  templateUrl: './heat-rejection-facility-review.component.html',
  providers: [FormGroupDirective, HeatRejectionFacilityFacade, HeatRejectionFacilityService],
})
export class HeatRejectionFacilityReviewComponent {
  reviewScreenValues: ReviewFieldConfig[] = [];
  selectHeatRejectionFacility$ = this.heatRejectionFacilityFacade.selectHeatRejectionFacility$;
  apiUpdateHeatRejectionFacilityPost$ = this.heatRejectionFacilityFacade.apiUpdateHeatRejectionFacilityPost$;
  heatRejectionFacilitySectionStatus$ = this.heatRejectionFacilityFacade.heatRejectionFacilitySectionStatus$;
  backButton$: Observable<string> = this.heatRejectionFacilitySectionStatus$.pipe(
    map(status => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.HEAT_REJECTION_FACILITY}`;
      }
    })
  );

  heatRejectionFacilityFormInputs$ = this.heatRejectionFacilityFacade.heatRejectionFacilityFormInputs$;
  private unsubscribe$ = new Subject<void>();
  private isComponentAlive = true;
  private isSubmissionNonEditable: boolean;
  isAnAssessor = false;

  constructor(
    private heatRejectionFacilityFacade: HeatRejectionFacilityFacade,
    private heatRejectionFacilityService: HeatRejectionFacilityService,
    private navigationService: NavigationService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.loadHeatRejectionFacilityDataForReview();
    this.registerLoadingSpinnerForApiResponses();

    this.sharedFacade
      .isSubmissionNonEditable()
      .pipe(takeWhile(() => this.isComponentAlive))
      .subscribe(nonEditable => (this.isSubmissionNonEditable = nonEditable));

    this.sharedFacade
      .isUserAnAssessor()
      .pipe(take(1))
      .subscribe(isAnAssessor => {
        this.isAnAssessor = isAnAssessor;
      });
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  handleFormSubmitted() {
    if (this.isSubmissionNonEditable) {
      this.navigationService.navigateToTaskList();
    } else {
      this.heatRejectionFacilityService
        .createPayloadToSubmitHeatRejectionFacilityAsComplete()
        .pipe(take(1))
        .subscribe(payload => {
          this.heatRejectionFacilityFacade.setHeatRejectionFacilitySectionAsComplete(payload);
        });
    }
  }

  private loadHeatRejectionFacilityDataForReview(): void {
    combineLatest([this.selectHeatRejectionFacility$, this.heatRejectionFacilityFormInputs$])
      .pipe(first())
      .subscribe(([heatRejectionFacility, formInputs]) => {
        this.reviewScreenValues = this.heatRejectionFacilityService.generateReviewYourAnswersFieldConfigs(heatRejectionFacility, formInputs);
      });
  }

  private registerLoadingSpinnerForApiResponses(): void {
    this.heatRejectionFacilityFacade.showLoadingSpinnerForApiResponses([this.apiUpdateHeatRejectionFacilityPost$], this.unsubscribe$);
  }
}
