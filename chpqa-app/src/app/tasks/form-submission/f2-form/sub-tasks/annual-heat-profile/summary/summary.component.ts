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
import { selectAnnualHeatProfileComments, selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { AnnualHeatProfile } from '../../../models/documentation.model';
import { DiagramType } from '../../../models/file-upload-details.model';
import { f2FormFeature, setAnnualHeatProfile, submitAnnualHeatProfile } from '../../../store';

@Component({
  selector: 'app-summary-annual-heat-profile',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
})
export class SummaryComponent implements OnInit {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.UploadAnnualHeatProfile)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.UPLOAD_ANNUAL_HEAT_PROFILE}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;

  annualHeatProfileSectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.UploadAnnualHeatProfile)));
  isSubmissionNonEditable: boolean;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  annualHeatProfile$ = this.store.select(f2FormFeature.selectAnnualHeatProfile);

  constructor(
    private readonly store: Store,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.loadAnnualHeatProfileDataForReview();
    this.sharedFacade
      .isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(isSubmissionNonEditable => {
        this.isSubmissionNonEditable = isSubmissionNonEditable;
      });

    this.setFormHeader();
  }

  private loadAnnualHeatProfileDataForReview(): void {
    this.ngxSpinner.show();

    this.store
      .select(selectSubmissionFormId)
      .pipe(
        take(1),
        switchMap(submissionFormId =>
          combineLatest([this.annualHeatProfile$, this.store.select(selectAnnualHeatProfileComments), this.isUserAnAssessor$]).pipe(
            first(),
            switchMap(([annualHeatProfileForm, commentsDB, isAssessor]) => {
              if (annualHeatProfileForm.files.length === 0) {
                return this.chqpaApiServiceWrapper.getSubmissionFilesListService
                  .apiSecureGetSubmissionFilesListGet(submissionFormId, DiagramType.AnnualHeatProfile)
                  .pipe(
                    map(annualHeatProfileDB => ({
                      annualHeatProfileForm,
                      annualHeatProfileDB,
                      comments: commentsDB.annualHeatProfileComments,
                      isAssessor,
                    }))
                  );
              } else {
                return of({
                  annualHeatProfileForm,
                  annualHeatProfileDB: [],
                  comments: commentsDB.annualHeatProfileComments,
                  isAssessor,
                });
              }
            })
          )
        )
      )
      .subscribe(({ annualHeatProfileForm, annualHeatProfileDB, comments, isAssessor }) => {
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(annualHeatProfileForm, annualHeatProfileDB, comments, isAssessor);
        this.ngxSpinner.hide();
      });
  }

  handleFormSubmitted(): void {
    if (this.isSubmissionNonEditable) {
      this.navigateToTaskList();
    } else {
      this.store.dispatch(submitAnnualHeatProfile());
    }
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review annual heat profile';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  generateReviewYourAnswersFieldConfigs(annualHeatProfile: any, annualHeatProfileDB: any, commentsDB: string, isAssessor: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const uploadLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.UPLOAD_ANNUAL_HEAT_PROFILE}`;

    const formFiles = annualHeatProfile?.files ?? [];
    const backendFiles = annualHeatProfileDB ? mapFiles(annualHeatProfileDB) : [];
    const allFiles = [...formFiles, ...backendFiles];
    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: isAssessor ? 'Uploaded documents' : 'Supporting documents',
      type: 'file',
      value: allFiles,
      showChangeLink: true,
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.ANNUAL_HEAT_PROFILE_DOCUMENTS,
    };

    const formComments = annualHeatProfile?.comments || '';
    const backendComments = [commentsDB];
    const combinedComments = formComments || backendComments.join(', ');
    const annualHeat = { files: allFiles, comments: combinedComments, deletedFileIds: annualHeatProfile.deletedFileIds } as AnnualHeatProfile;
    if (annualHeatProfile.files.length === 0 && annualHeatProfile.comments.length === 0 && annualHeatProfile.deletedFileIds.length === 0) {
      this.store.dispatch(
        setAnnualHeatProfile({
          annualHeatProfile: annualHeat,
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
        ariaLabel: ChangeLinkAriaLabel.ANNUAL_HEAT_PROFILE_COMMENTS,
      },
    ];
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
