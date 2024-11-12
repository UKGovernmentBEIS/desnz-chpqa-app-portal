import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { SummaryComponent } from 'src/app/tasks/form-submission/components/summary/summary.component';
import { Observable, combineLatest, first, map } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectRequestRocCertificate, setRequestRocCertificate, submitRequestRocCertificate } from '../../../store';
import { TrueFalsePipe } from '@shared/pipes/true-false.pipe';
import { SummaryDetails, SummaryKeyValues } from 'src/app/tasks/form-submission/model/summary-details.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { selectSubmissionForm } from '../../hours-of-operation/state/hours-of-operation.selectors';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { NavigationService } from '@shared/services/navigation.service';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';

@Component({
  selector: 'app-roc-certificate-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [
    CommonModule,
    SummaryComponent,
    ReviewAnswersComponent
  ],
  providers: [ TrueFalsePipe ]
})
export class RocCertificateSummaryComponent {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.RenewablesObligationCertificate)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.REQUEST_ROC_CERTIFICATE}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;

  constructor(
    private trueFalsePipe: TrueFalsePipe,
    private readonly store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private navigationService: NavigationService
  ) {
    this.loadRocCertificateDataForReview();
  }

  private loadRocCertificateDataForReview(): void {
    this.ngxSpinner.show();
    combineLatest([
      this.store.select(selectRequestRocCertificate),
      this.store.select(selectSubmissionForm),
      this.store.select(selectSectionStatus(SubmissionGroupType.RenewablesObligationCertificate)),

    ])
      .pipe(first())
      .subscribe(([requestRocCertificate, submissionForm, sectionStatus]) => {
        this.sectionStatus = sectionStatus;
        if (requestRocCertificate !== null && requestRocCertificate !== undefined) {
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(requestRocCertificate)
        } else if (this.sectionStatus === Status.Completed && (submissionForm.rocsCertificate !== null && submissionForm.rocsCertificate !== undefined)) {
          this.store.dispatch(
            setRequestRocCertificate({
              requestRocCertificate: submissionForm.rocsCertificate,
            })
          );
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(submissionForm.rocsCertificate)
        }
        this.ngxSpinner.hide();
      });
  }


  handleFormSubmitted(): void {
    this.store.dispatch(submitRequestRocCertificate());
  }

  private generateReviewYourAnswersFieldConfigs(requestRocCertificate: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const changeLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.REQUEST_ROC_CERTIFICATE}`;
    return [
      {
        name: 'requestRocCertificate',
        label: 'Do you need a Renewables Obligation certificate?',
        type: 'text',
        changeLink: changeLink,
        showChangeLink: true,
        value: this.trueFalsePipe.transform(requestRocCertificate),
        ariaLabel: ChangeLinkAriaLabel.ROC_CERTIFICATE
      },
    ];
  }
}
