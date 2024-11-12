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
import { selectHeatLoadDurationCurveComments, selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { HeatLoadDurationCurve } from '../../../models/documentation.model';
import { DiagramType } from '../../../models/file-upload-details.model';
import { f2FormFeature, setHeatLoadDurationCurve, submitHeatLoadDurationCurve } from '../../../store';

@Component({
  selector: 'app-summary-heat-load-duration-curve',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
})
export class SummaryComponent implements OnInit {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.UploadHeatLoadDurationCurve)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.UPLOAD_HEAT_LOAD_DURATION_CURVE}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;

  heatLoadDurationCurveSectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.UploadHeatLoadDurationCurve)));
  isSubmissionNonEditable: boolean;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  heatLoadDurationCurve$ = this.store.select(f2FormFeature.selectHeatLoadDurationCurve);

  constructor(
    private readonly store: Store,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.loadHeatLoadDurationCurveDataForReview();
    this.sharedFacade
      .isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(isSubmissionNonEditable => {
        this.isSubmissionNonEditable = isSubmissionNonEditable;
      });

    this.setFormHeader();
  }

  private loadHeatLoadDurationCurveDataForReview(): void {
    this.ngxSpinner.show();
    this.store
      .select(selectSubmissionFormId)
      .pipe(
        take(1),
        switchMap(submissionFormId =>
          combineLatest([this.heatLoadDurationCurve$, this.store.select(selectHeatLoadDurationCurveComments), this.isUserAnAssessor$]).pipe(
            first(),
            switchMap(([heatLoadDurationCurveForm, commentsDB, isAssessor]) => {
              if (heatLoadDurationCurveForm.files.length === 0) {
                return this.chqpaApiServiceWrapper.getSubmissionFilesListService
                  .apiSecureGetSubmissionFilesListGet(submissionFormId, DiagramType.HeatLoadDurationCurve)
                  .pipe(
                    map(heatLoadDurationCurveDB => ({
                      heatLoadDurationCurveForm,
                      heatLoadDurationCurveDB,
                      comments: commentsDB.heatLoadDurationCurveComments,
                      isAssessor,
                    }))
                  );
              } else {
                return of({
                  heatLoadDurationCurveForm,
                  heatLoadDurationCurveDB: [],
                  comments: commentsDB.heatLoadDurationCurveComments,
                  isAssessor,
                });
              }
            })
          )
        )
      )
      .subscribe(({ heatLoadDurationCurveForm, heatLoadDurationCurveDB, comments, isAssessor }) => {
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(heatLoadDurationCurveForm, heatLoadDurationCurveDB, comments, isAssessor);
        this.ngxSpinner.hide();
      });
  }

  handleFormSubmitted(): void {
    if (this.isSubmissionNonEditable) {
      this.navigateToTaskList();
    } else {
      this.store.dispatch(submitHeatLoadDurationCurve());
    }
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review heat load duration curve';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  private generateReviewYourAnswersFieldConfigs(
    heatLoadDurationCurve: any,
    heatLoadDurationCurveDB: any,
    commentsDB: string,
    isAssessor: boolean
  ): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const uploadLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.UPLOAD_HEAT_LOAD_DURATION_CURVE}`;

    const formFiles = heatLoadDurationCurve?.files ?? [];
    const backendFiles = heatLoadDurationCurveDB ? mapFiles(heatLoadDurationCurveDB) : [];
    const allFiles = [...formFiles, ...backendFiles];
    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: isAssessor ? 'Uploaded documents' : 'Supporting documents',
      type: 'file',
      value: allFiles,
      showChangeLink: true,
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.HEAT_LOAD_DURATION_CURVE_DOCUMENTS,
    };

    const formComments = heatLoadDurationCurve?.comments || '';
    const backendComments = [commentsDB];
    const combinedComments = formComments || backendComments.join(', ');
    const heatLoad = { files: allFiles, comments: combinedComments, deletedFileIds: heatLoadDurationCurve.deletedFileIds } as HeatLoadDurationCurve;
    if (heatLoadDurationCurve.files.length === 0 && heatLoadDurationCurve.comments.length === 0 && heatLoadDurationCurve.deletedFileIds.length === 0) {
      this.store.dispatch(
        setHeatLoadDurationCurve({
          heatLoadDurationCurve: heatLoad,
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
        ariaLabel: ChangeLinkAriaLabel.HEAT_LOAD_DURATION_CURVE_COMMENTS,
      },
    ];
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
