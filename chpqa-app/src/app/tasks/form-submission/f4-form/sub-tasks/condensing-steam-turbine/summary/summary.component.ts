import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectCondensingSteamTurbine, submitCondensingSteamTurbine } from '../../../store';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, first, map, take } from 'rxjs';
import { SummaryComponent } from 'src/app/tasks/form-submission/components/summary/summary.component';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';

@Component({
  selector: 'app-condensing-steam-turbine-summary',
  standalone: true,
  imports: [AsyncPipe, NgIf, SummaryComponent, ReviewAnswersComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class CondensingSteamTurbineSummaryComponent {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.ProvideCondensingStreamTurbineDetails)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.CONDESING_STEAM_TURBINE}`;
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
      this.store.select(selectCondensingSteamTurbine),
      this.store.select(selectSectionStatus(SubmissionGroupType.ProvideCondensingStreamTurbineDetails)),
      this.sharedFacade.isUserAnAssessor(),
    ])
      .pipe(first())
      .subscribe(([condensingSteamTurbine, sectionStatus, isUserAnAssessor]) => {
        this.sectionStatus = sectionStatus;
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(condensingSteamTurbine);
        this.setFormHeader(isUserAnAssessor);
        this.ngxSpinner.hide();
      });
  }

  setFormHeader(isAssessor: boolean) {
    this.formHeader = isAssessor ? 'Review condensing steam turbine details' : 'Check your answers';
  }

  private generateReviewYourAnswersFieldConfigs(condensingSteamTurbine: any): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId']; // Assuming 'submissionFormId' is another route param
    const inputLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.CONDESING_STEAM_TURBINE}`;
    const reviewScreenValues: ReviewFieldConfig[] = [
      {
        name: 'zRatioDetermined',
        label: 'Z ratio determined by plant trials?',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: condensingSteamTurbine?.zRatioDetermined?.label,
        ariaLabel: ChangeLinkAriaLabel.Z_RATIO,
      },

      {
        name: 'steamExportPressure',
        label: 'Steam export pressure',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: condensingSteamTurbine?.steamExportPressure as unknown as string,
        ariaLabel: ChangeLinkAriaLabel.STEAM_EXPORT_PRESSURE,
      },
      {
        name: 'steamTurbineSize',
        label: 'Steam turbine size',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: condensingSteamTurbine?.steamTurbineSize as unknown as string,
        ariaLabel: ChangeLinkAriaLabel.STEAM_TURBINE_SIZE,
      },
      {
        name: 'zRatio',
        label: 'Z ratio of this scheme',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: condensingSteamTurbine?.zRatio as unknown as string,
        ariaLabel: ChangeLinkAriaLabel.Z_RATIO_SCHEME,
      },
    ];
    if (condensingSteamTurbine?.zRatioDetermined?.value === false) {
      const reasonForNo: ReviewFieldConfig = {
        name: 'possibleToDetermineZRatio',
        label: 'Reason for no',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: condensingSteamTurbine?.possibleToDetermineZRatio,
        ariaLabel: ChangeLinkAriaLabel.REASON_FOR_NO,
      };
      reviewScreenValues.splice(1, 0, reasonForNo);
    }
    return reviewScreenValues;
  }

  handleFormSubmitted(): void {
    this.nonEditableSubmission$.pipe(take(1)).subscribe(isSubmissionNonEditable => {
      isSubmissionNonEditable ? this.navigationService.navigateToTaskList() : this.store.dispatch(submitCondensingSteamTurbine());
    });
  }
}
