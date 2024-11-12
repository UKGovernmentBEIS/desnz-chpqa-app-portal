import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { SharedFacade, selectSubmissionFormId } from '@shared/store';
import { mapFiles } from '@shared/utils/data-transform-utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, combineLatest, first, map, of, switchMap, take } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectDailyHeatProfileComments, selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { DailyHeatProfile } from '../../../models/documentation.model';
import { DiagramType } from '../../../models/file-upload-details.model';
import { f2FormFeature, setDailyHeatProfile, submitDailyHeatProfile } from '../../../store';

@Component({
  selector: 'app-summary-daily-heat-profile',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
})
export class SummaryComponent implements OnInit {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.UploadDailyHeatProfile)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.UPLOAD_DAILY_HEAT_PROFILE}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;

  dailyHeatProfileSectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.UploadDailyHeatProfile)));
  isSubmissionNonEditable: boolean;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  dailyHeatProfile$ = this.store.select(f2FormFeature.selectDailyHeatProfile);

  constructor(
    private readonly store: Store,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}
  ngOnInit(): void {
    this.loadDailyHeatProfileDataForReview();
    this.sharedFacade
      .isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(isSubmissionNonEditable => {
        this.isSubmissionNonEditable = isSubmissionNonEditable;
      });

    this.setFormHeader();
  }

  private loadDailyHeatProfileDataForReview(): void {
    this.ngxSpinner.show();

    this.store
      .select(selectSubmissionFormId)
      .pipe(
        take(1),
        switchMap(submissionFormId =>
          combineLatest([this.dailyHeatProfile$, this.store.select(selectDailyHeatProfileComments), this.isUserAnAssessor$]).pipe(
            first(),
            switchMap(([dailyHeatProfileForm, commentsDB, isAssessor]) => {
              if (dailyHeatProfileForm.files.length === 0) {
                return this.chqpaApiServiceWrapper.getSubmissionFilesListService
                  .apiSecureGetSubmissionFilesListGet(submissionFormId, DiagramType.DailyHeatProfile)
                  .pipe(
                    map(dailyHeatProfileDB => ({
                      dailyHeatProfileForm,
                      dailyHeatProfileDB,
                      comments: commentsDB.dailyHeatProfileComments,
                      isAssessor,
                    }))
                  );
              } else {
                return of({
                  dailyHeatProfileForm,
                  dailyHeatProfileDB: [],
                  comments: commentsDB.dailyHeatProfileComments,
                  isAssessor,
                });
              }
            })
          )
        )
      )
      .subscribe(({ dailyHeatProfileForm, dailyHeatProfileDB, comments, isAssessor }) => {
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(dailyHeatProfileForm, dailyHeatProfileDB, comments, isAssessor);
        this.ngxSpinner.hide();
      });
  }

  handleFormSubmitted(): void {
    if (this.isSubmissionNonEditable) {
      this.navigateToTaskList();
    } else {
      this.store.dispatch(submitDailyHeatProfile());
    }
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review daily heat profile';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  generateReviewYourAnswersFieldConfigs(dailyHeatProfile: any, dailyHeatProfileDB: any, commentsDB: string, isAssessor: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const uploadLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.UPLOAD_DAILY_HEAT_PROFILE}`;

    const formFiles = dailyHeatProfile?.files ?? [];
    const backendFiles = dailyHeatProfileDB ? mapFiles(dailyHeatProfileDB) : [];
    const allFiles = [...formFiles, ...backendFiles];
    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: isAssessor ? 'Uploaded documents' : 'Supporting documents',
      type: 'file',
      value: allFiles,
      showChangeLink: true,
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.DAILY_HEAT_PROFILE_DOCUMENTS,
    };

    const formComments = dailyHeatProfile?.comments || '';
    const backendComments = [commentsDB];
    const combinedComments = formComments || backendComments.join(', ');
    const dailyHeat = { files: allFiles, comments: combinedComments, deletedFileIds: dailyHeatProfile.deletedFileIds } as DailyHeatProfile;
    if (dailyHeatProfile.files.length === 0 && dailyHeatProfile.comments.length === 0 && dailyHeatProfile.deletedFileIds.length === 0) {
      this.store.dispatch(
        setDailyHeatProfile({
          dailyHeatProfile: dailyHeat,
        })
      );
    }

    return [
      aggregatedDocumentsField,
      {
        name: 'comments',
        label: isAssessor ? 'RP comments' : 'Your comments',
        type: 'textarea',
        showChangeLink: true,
        changeLink: uploadLink,
        value: combinedComments,
        ariaLabel: ChangeLinkAriaLabel.DAILY_HEAT_PROFILE_COMMENTS,
      },
    ];
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
