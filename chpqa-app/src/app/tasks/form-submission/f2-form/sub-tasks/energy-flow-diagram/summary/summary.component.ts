import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { selectSubmissionFormId, SharedFacade } from '@shared/store';
import { mapFiles } from '@shared/utils/data-transform-utils';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, first, map, Observable, of, switchMap, take } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectEnergyFlowDiagramComments, selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { EnergyFlow } from '../../../models/documentation.model';
import { DiagramType } from '../../../models/file-upload-details.model';
import { f2FormFeature, submitEnergyFlow } from '../../../store';
import { setEnergyFlow } from '../../../store/f2-form.actions';

@Component({
  selector: 'app-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, RouterModule, ReviewAnswersComponent],
})
export class SummaryComponent implements OnInit {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.UploadEnergyFlowDiagram)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.UPLOAD_ENERGY_FLOW_DIAGRAM}`;
      }
    })
  );

  reviewScreenValues: any[] = [];

  energyFlowSectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.UploadEnergyFlowDiagram)));
  energyFlow$ = this.store.select(f2FormFeature.selectEnergyFlow);
  isSubmissionNonEditable: boolean;
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();
  formHeader: string = 'Check your answers';

  constructor(
    private readonly store: Store,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade
  ) {}
  ngOnInit(): void {
    this.loadEnergyFlowDiagramDataForReview();
     this.sharedFacade.isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(isSubmissionNonEditable => {
        this.isSubmissionNonEditable = isSubmissionNonEditable;
      });

      this.setFormHeader();
  }

  loadEnergyFlowDiagramDataForReview(): void {
    this.ngxSpinner.show();

    this.store
      .select(selectSubmissionFormId)
      .pipe(
        take(1),
        switchMap(submissionFormId =>
          combineLatest([this.energyFlow$, this.store.select(selectEnergyFlowDiagramComments), this.isUserAnAssessor$]).pipe(
            first(),
            switchMap(([energyFlowForm, commentsDB, isAssessor]) => {
              if (energyFlowForm.files.length === 0) {
                return this.chqpaApiServiceWrapper.getSubmissionFilesListService
                  .apiSecureGetSubmissionFilesListGet(submissionFormId, DiagramType.EnergyFlowDiagram)
                  .pipe(
                    map(energyFlowDB => ({
                      energyFlowForm,
                      energyFlowDB,
                      comments: commentsDB.energyFlowDiagramComments,
                      isAssessor
                    }))
                  );
              } else {
                return of({
                  energyFlowForm,
                  energyFlowDB: [],
                  comments: commentsDB.energyFlowDiagramComments,
                  isAssessor
                });
              }
            })
          )
        )
      )
      .subscribe(({ energyFlowForm, energyFlowDB, comments, isAssessor }) => {
        this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(energyFlowForm, energyFlowDB, comments, isAssessor);
        this.ngxSpinner.hide();
      });
  }

  handleFormSubmitted(): void {
    if (this.isSubmissionNonEditable) {
      this.navigateToTaskList();
    } else {
      this.store.dispatch(submitEnergyFlow());
    }
  }

  setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review energy flow diagram';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }

  generateReviewYourAnswersFieldConfigs(energyFlowForm: any, energyFlowDB: any, commentsDB: string, isAssessor: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const uploadLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.UPLOAD_ENERGY_FLOW_DIAGRAM}`;

    const formFiles = energyFlowForm?.files ?? [];
    const backendFiles = energyFlowDB ? mapFiles(energyFlowDB) : [];
    const allFiles = [...formFiles, ...backendFiles];
    const aggregatedDocumentsField: ReviewFieldConfig = {
      name: 'documents',
      label: isAssessor ? 'Uploaded documents' : 'Supporting documents',
      type: 'file',
      value: allFiles,
      showChangeLink: true,
      changeLink: uploadLink,
      ariaLabel: ChangeLinkAriaLabel.ENERGY_FLOW_DIAGRAM_DOCUMENTS
    };

    const formComments = energyFlowForm?.comments || '';
    const backendComments = [commentsDB];
    const combinedComments = formComments || backendComments.join(', ');
    const energyFlow = { files: allFiles, comments: combinedComments, deletedFileIds: energyFlowForm.deletedFileIds } as EnergyFlow;
    if (energyFlowForm.files.length === 0 && energyFlowForm.comments.length === 0 && energyFlowForm.deletedFileIds.length === 0) {
      this.store.dispatch(setEnergyFlow({ energyFlow }));
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
        ariaLabel: ChangeLinkAriaLabel.ENERGY_FLOW_DIAGRAM_COMMENTS
      },
    ];
  }


  private navigateToTaskList(): void {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
