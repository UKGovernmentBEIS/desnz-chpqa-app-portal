import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { TrueFalsePipe } from '@shared/pipes/true-false.pipe';
import { Observable, combineLatest, first, map, take } from 'rxjs';
import { SummaryComponent } from 'src/app/tasks/form-submission/components/summary/summary.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { selectRequestCfdCertificate, setRequestCfdCertificate, submitRequestCfdCertificate } from '../../../store';
import { selectSubmissionForm } from '../../hours-of-operation/state/hours-of-operation.selectors';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';

@Component({
  selector: 'app-cfd-certificate-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, SummaryComponent, ReviewAnswersComponent],
  providers: [TrueFalsePipe],
})
export class CfdCertificateSummaryComponent {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.ContractsForDifferenceCertificate)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.REQUEST_CFD_CERTIFICATE}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;
  nonEditableSubmission$ = this.sharedFacade.isSubmissionNonEditable();

  constructor(
    private trueFalsePipe: TrueFalsePipe,
    private readonly store: Store,
    private route: ActivatedRoute,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade,
    private navigationService: NavigationService
  ) {
    this.loadCfdCertificateDataForReview();
  }

  private loadCfdCertificateDataForReview(): void {
    this.ngxSpinner.show();
    combineLatest([
      this.store.select(selectRequestCfdCertificate),
      this.store.select(selectSubmissionForm),
      this.store.select(selectSectionStatus(SubmissionGroupType.ContractsForDifferenceCertificate)),
    ])
      .pipe(first())
      .subscribe(([requestCfdCertificate, submissionForm, sectionStatus]) => {
        this.sectionStatus = sectionStatus;
        if (requestCfdCertificate !== null && requestCfdCertificate !== undefined) {
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(requestCfdCertificate);
        } else if (this.sectionStatus === Status.Completed && submissionForm.cfdCertificate !== null && submissionForm.cfdCertificate !== undefined) {
          this.store.dispatch(
            setRequestCfdCertificate({
              requestCfdCertificate: submissionForm.cfdCertificate,
            })
          );
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(submissionForm.cfdCertificate);
        }
        this.ngxSpinner.hide();
      });
  }

  handleFormSubmitted(): void {
    this.nonEditableSubmission$.pipe(take(1)).subscribe(isSubmissionNonEditable => {
      isSubmissionNonEditable ? this.navigationService.navigateToTaskList() : this.store.dispatch(submitRequestCfdCertificate());
    });
  }

  private generateReviewYourAnswersFieldConfigs(requestCfdCertificate: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const changeLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.REQUEST_CFD_CERTIFICATE}`;
    return [
      {
        name: 'requestCfdCertificate',
        label: 'Do you need a Contracts for Difference certificate?',
        type: 'text',
        changeLink: changeLink,
        showChangeLink: true,
        value: this.trueFalsePipe.transform(requestCfdCertificate),
        ariaLabel: ChangeLinkAriaLabel.CFD_CERTIFICATE,
      },
    ];
  }
}
