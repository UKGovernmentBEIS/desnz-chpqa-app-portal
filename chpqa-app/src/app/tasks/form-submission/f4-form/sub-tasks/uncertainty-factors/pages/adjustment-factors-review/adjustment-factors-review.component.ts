import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { PerfomanceSummaryListComponent } from '@shared/components/perfomance-summary-list/perfomance-summary-list.component';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { FormErrorDirective } from '@shared/directives/form-error.directive';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { DecimalFormatterPipe } from '@shared/pipes/decimal-formatter.pipe';
import { selectSubmissionFormId, SharedFacade } from '@shared/store';
import { mapFiles } from '@shared/utils/data-transform-utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, first, map, Observable, of, switchMap, take } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { UncertaintyAdjustmentFactors } from 'src/app/tasks/form-submission/f2-form/models/documentation.model';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionStatus, selectUncertaintyFactors, selectUncertaintyFactorsComments } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { GovukUnitInputComponent } from '../../../../../../../shared/components/form-controls/govuk-unit-input/govuk-unit-input.component';
import { UncertaintyFactors } from '../../config/uncertainty-factors.model';
import { setUncertaintyFactorsUploadedDocuments, setUncertaintyFactorsValues, submitUncertaintyFactors } from '../../state/uncertainty-factors.actions';
import { UncertaintyFactorsSelectors } from '../../state/uncertainty-factors.selectors';

@Component({
  selector: 'app-adjustment-factors-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    RouterModule,
    FormErrorDirective,
    PerfomanceSummaryListComponent,
    GovukUnitInputComponent,
    DecimalFormatterPipe,
    ReviewAnswersComponent,
  ],
  templateUrl: './adjustment-factors-review.component.html',
})
export class AdjustmentFactorsReviewComponent {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.ProvideUncertaintyFactors)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_UPLOAD}`;
      }
    })
  );
  reviewScreenValues: ReviewFieldConfig[] = [];

  uncertaintyFactorsSectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.ProvideUncertaintyFactors)));
  isSubmissionNonEditable: boolean;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  constructor(
    private store: Store,

    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.loadUncertaintyFactorsDataForReview();
    this.sharedFacade
      .isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(isSubmissionNonEditable => {
        this.isSubmissionNonEditable = isSubmissionNonEditable;
      });

    this.setFormHeader();
  }

  private loadUncertaintyFactorsDataForReview(): void {
    this.ngxSpinner.show();

    this.store
      .select(selectSubmissionFormId)
      .pipe(
        take(1),
        switchMap(submissionFormId =>
          combineLatest([
            this.store.pipe(select(UncertaintyFactorsSelectors.selectUncertaintyFactorsValues)),
            this.store.pipe(select(selectUncertaintyFactors)),
            this.store.select(UncertaintyFactorsSelectors.selectUncertaintyFactorsUploadedDocuments),
            this.store.select(selectUncertaintyFactorsComments),
            this.sharedFacade.isUserAnAssessor(),
          ]).pipe(
            first(),
            switchMap(([uncertaintyFactorsValuesFormInputs, uncertaintyFactorsValuesDB, uncertaintyFactorsUploadedDocuments, commentsDB, isAssessor]) => {
              if (uncertaintyFactorsUploadedDocuments.files.length === 0) {
                return this.chqpaApiServiceWrapper.getSubmissionFilesListService.apiSecureGetSubmissionFilesListGet(submissionFormId, 5).pipe(
                  map(uncertaintyFactorsUploadedDocumentsDB => ({
                    uncertaintyFactorsValuesFormInputs,
                    uncertaintyFactorsValuesDB,
                    uncertaintyFactorsUploadedDocuments,
                    uncertaintyFactorsUploadedDocumentsDB,
                    comments: commentsDB.uncertaintyFactorsComments,
                    isAssessor,
                  }))
                );
              } else {
                return of({
                  uncertaintyFactorsValuesFormInputs,
                  uncertaintyFactorsValuesDB,
                  uncertaintyFactorsUploadedDocuments,
                  uncertaintyFactorsUploadedDocumentsDB: [],
                  comments: commentsDB.uncertaintyFactorsComments,
                  isAssessor,
                });
              }
            })
          )
        )
      )
      .subscribe(
        ({
          uncertaintyFactorsValuesFormInputs,
          uncertaintyFactorsValuesDB,
          uncertaintyFactorsUploadedDocuments,
          uncertaintyFactorsUploadedDocumentsDB,
          comments,
          isAssessor,
        }) => {
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(
            uncertaintyFactorsValuesFormInputs,
            uncertaintyFactorsValuesDB,
            uncertaintyFactorsUploadedDocuments,
            uncertaintyFactorsUploadedDocumentsDB,
            comments,
            isAssessor
          );
          this.ngxSpinner.hide();
        }
      );
  }

  handleFormSubmitted(): void {
    if (this.isSubmissionNonEditable) {
      this.navigateToTaskList();
    } else {
      this.store.dispatch(submitUncertaintyFactors());
    }
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review uncertainty adjustment factors';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  generateReviewYourAnswersFieldConfigs(
    uncertaintyFactorsValuesFormInputs: UncertaintyFactors,
    uncertaintyFactorsValuesDB,
    uncertaintyFactorsUploadedDocuments: UncertaintyAdjustmentFactors,
    uncertaintyFactorsUploadedDocumentsDB: any[],
    commentsDB: string,
    isAssessor: boolean
  ): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const uploadLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_UPLOAD}`;
    const inputLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS}`;

    const formFiles = uncertaintyFactorsUploadedDocuments?.files ?? [];
    const backendFiles = uncertaintyFactorsUploadedDocumentsDB ? mapFiles(uncertaintyFactorsUploadedDocumentsDB) : [];
    const allFiles = [...formFiles, ...backendFiles];
    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: isAssessor ? 'Uploaded documents' : 'Supporting documents',
      type: 'file',
      value: allFiles,
      showChangeLink: true,
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.UNCERTAINTY_ADJUSTMENT_FACTOR_DOCUMENTS,
    };

    const formComments = uncertaintyFactorsUploadedDocuments?.comments || '';
    const backendComments = [commentsDB];
    const combinedComments = formComments || backendComments.join(', ');
    const uncertaintyFactorsDocuments = {
      files: allFiles,
      comments: combinedComments,
      deletedFileIds: uncertaintyFactorsUploadedDocuments.deletedFileIds,
    } as UncertaintyAdjustmentFactors;
    if (
      uncertaintyFactorsUploadedDocuments.files.length === 0 &&
      uncertaintyFactorsUploadedDocuments.comments.length === 0 &&
      uncertaintyFactorsUploadedDocuments.deletedFileIds.length === 0
    ) {
      this.store.dispatch(
        setUncertaintyFactorsUploadedDocuments({
          uncertaintyFactorsUploadedDocuments: uncertaintyFactorsDocuments,
        })
      );
    }
    if (!uncertaintyFactorsValuesFormInputs.foi && !uncertaintyFactorsValuesFormInputs.foh && !uncertaintyFactorsValuesFormInputs.fop) {
      this.store.dispatch(
        setUncertaintyFactorsValues({
          uncertaintyFactorsValues: uncertaintyFactorsValuesDB,
        })
      );
    }

    return [
      {
        name: 'foi',
        label: 'Fuel Uncertainty Adjustment Factor FOI',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: uncertaintyFactorsValuesFormInputs?.foi ?? uncertaintyFactorsValuesDB?.foi ?? '',
        ariaLabel: ChangeLinkAriaLabel.FUEL_UNCERTAINTY_ADJUSTMENT_FACTOR,
      },
      {
        name: 'fop',
        label: 'Power Uncertainty Adjustment Factor FOP',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: uncertaintyFactorsValuesFormInputs?.fop ?? uncertaintyFactorsValuesDB?.fop ?? '',
        ariaLabel: ChangeLinkAriaLabel.POWER_UNCERTAINTY_ADJUSTMENT_FACTOR,
      },
      {
        name: 'foh',
        label: 'Heat Uncertainty Adjustment Factor FOH',
        type: 'text',
        changeLink: inputLink,
        showChangeLink: true,
        value: uncertaintyFactorsValuesFormInputs?.foh ?? uncertaintyFactorsValuesDB?.foh ?? '',
        ariaLabel: ChangeLinkAriaLabel.HEAT_UNCERTAINTY_ADJUSTMENT_FACTOR,
      },
      aggregatedDocumentsField,
      {
        name: 'comments',
        label: isAssessor ? 'RP comments' : 'Your comments',
        type: 'textarea',
        changeLink: uploadLink,
        showChangeLink: true,
        value: combinedComments,
        ariaLabel: ChangeLinkAriaLabel.UNCERTAINTY_ADJUSTMENT_FACTOR_COMMENTS,
      },
    ];
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
