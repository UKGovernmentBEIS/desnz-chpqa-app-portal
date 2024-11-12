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
import { selectSchemeLineDiagramComments, selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { SchemeLineDiagram } from '../../../models/documentation.model';
import { DiagramType } from '../../../models/file-upload-details.model';
import { f2FormFeature, setSchemeLineDiagram, submitSchemeLineDiagram } from '../../../store';

@Component({
  selector: 'app-summary-scheme-line-diagram',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
})
export class SummaryComponent implements OnInit {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.UploadSchemeLineDiagram)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.UPLOAD_SCHEME_LINE_DIAGRAM}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;

  schemeLineDiagramSectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.UploadSchemeLineDiagram)));
  isSubmissionNonEditable: boolean;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  schemeLineDiagram$ = this.store.select(f2FormFeature.selectSchemeLineDiagram);

  constructor(
    private readonly store: Store,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.loadSchemeLineDiagramDataForReview();
    this.sharedFacade
      .isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(isSubmissionNonEditable => {
        this.isSubmissionNonEditable = isSubmissionNonEditable;
      });

    this.setFormHeader();
  }

  private loadSchemeLineDiagramDataForReview(): void {
    this.ngxSpinner.show();

    this.store
      .select(selectSubmissionFormId)
      .pipe(
        take(1),
        switchMap(submissionFormId =>
          combineLatest([this.schemeLineDiagram$, this.store.select(selectSchemeLineDiagramComments), this.isUserAnAssessor$]).pipe(
            first(),
            switchMap(([schemeLineDiagramForm, commentsDB, isAssessor]) => {
              if (schemeLineDiagramForm.files.length === 0) {
                return this.chqpaApiServiceWrapper.getSubmissionFilesListService
                  .apiSecureGetSubmissionFilesListGet(submissionFormId, DiagramType.SchemeLineDiagram)
                  .pipe(
                    map(schemeLineDiagramDB => ({
                      schemeLineDiagramForm,
                      schemeLineDiagramDB,
                      comments: commentsDB.schemeLineDiagramComments,
                      isAssessor,
                    }))
                  );
              } else {
                return of({
                  schemeLineDiagramForm,
                  schemeLineDiagramDB: [],
                  comments: commentsDB.schemeLineDiagramComments,
                  isAssessor,
                });
              }
            })
          )
        )
      )
      .subscribe(({ schemeLineDiagramForm, schemeLineDiagramDB, comments, isAssessor }) => {
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(schemeLineDiagramForm, schemeLineDiagramDB, comments, isAssessor);
        this.ngxSpinner.hide();
      });
  }

  handleFormSubmitted(): void {
    if (this.isSubmissionNonEditable) {
      this.navigateToTaskList();
    } else {
      this.store.dispatch(submitSchemeLineDiagram());
    }
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review scheme line diagram';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  generateReviewYourAnswersFieldConfigs(schemeLineDiagram: any, schemeLineDiagramDB: any, commentsDB: string, isAssessor: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const uploadLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.UPLOAD_SCHEME_LINE_DIAGRAM}`;

    const formFiles = schemeLineDiagram?.files ?? [];
    const backendFiles = schemeLineDiagramDB ? mapFiles(schemeLineDiagramDB) : [];
    const allFiles = [...formFiles, ...backendFiles];
    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: isAssessor ? 'Uploaded documents' : 'Supporting documents',
      type: 'file',
      value: allFiles,
      showChangeLink: true,
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.SCHEME_LINE_DIAGRAM_DOCUMENTS,
    };

    const formComments = schemeLineDiagram?.comments || '';
    const backendComments = [commentsDB];
    const combinedComments = formComments || backendComments.join(', ');
    const schemeLine = { files: allFiles, comments: combinedComments, deletedFileIds: schemeLineDiagram.deletedFileIds } as SchemeLineDiagram;
    if (schemeLineDiagram.files.length === 0 && schemeLineDiagram.comments.length === 0 && schemeLineDiagram.deletedFileIds.length === 0) {
      this.store.dispatch(
        setSchemeLineDiagram({
          schemeLineDiagram: schemeLine,
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
        ariaLabel: ChangeLinkAriaLabel.SCHEME_LINE_DIAGRAM_COMMENTS,
      },
    ];
  }

  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
