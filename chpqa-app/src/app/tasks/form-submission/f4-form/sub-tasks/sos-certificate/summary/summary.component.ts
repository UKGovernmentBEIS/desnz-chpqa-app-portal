import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { TrueFalsePipe } from '@shared/pipes/true-false.pipe';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, combineLatest, first, map, take } from 'rxjs';
import { SummaryComponent } from 'src/app/tasks/form-submission/components/summary/summary.component';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { setRequestSoSCertificate, submitRequestSoSCertificate, selectRequestSoSCertificate } from '../../../store';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';

@Component({
  selector: 'app-sos-certificate-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [
    CommonModule,
    NgIf,
    AsyncPipe,
    SummaryComponent,
    ReviewAnswersComponent
  ],
  providers: [ TrueFalsePipe ]
})
export class SoSCertificateSummaryComponent {
  backButton$: Observable<string> = this.store.pipe(
    select(selectSectionStatus(SubmissionGroupType.SecretaryOfStateExemptionCertificate)),
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.REQUEST_SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE}`;
      }
    })
  );

  formHeader: string = 'Check your answers';
  reviewScreenValues: ReviewFieldConfig[] = [];
  sectionStatus: Status = null;
  nonEditableSubmission$ = this.sharedFacade.isSubmissionNonEditable();
  isUserAnAssessor$ = this.sharedFacade.isUserAnAssessor();

  constructor(
    private trueFalsePipe: TrueFalsePipe,
    private readonly store: Store,
    private route: ActivatedRoute,
    private ngxSpinner: NgxSpinnerService,
    private sharedFacade: SharedFacade,
    private navigationService: NavigationService
  ) {
    this.loadSoSCertificateDataForReview();
  }

  private loadSoSCertificateDataForReview(): void {
    this.ngxSpinner.show();
    combineLatest([
      this.store.select(selectRequestSoSCertificate),
      this.store.select(selectSubmissionForm)
    ])
      .pipe(first())
      .subscribe(([requestSoSCertificateState, requestSoSCertificateDB ]) => {
        if (requestSoSCertificateState === null || requestSoSCertificateState === undefined ) {
          this.store.dispatch(
            setRequestSoSCertificate({
              requestSoSCertificate: requestSoSCertificateDB.sosCertificate,
            })
          );
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(requestSoSCertificateDB.sosCertificate)
        }else {
          this.reviewScreenValues = this.generateReviewYourAnswersFieldConfigs(requestSoSCertificateState);
        }
        this.ngxSpinner.hide();
      });
      this.setFormHeader();
  }


  handleFormSubmitted(): void {
    this.nonEditableSubmission$.pipe(take(1)).subscribe(isSubmissionNonEditable => {
      isSubmissionNonEditable
      ? this.navigationService.navigateToTaskList()
      :  this.store.dispatch(submitRequestSoSCertificate());
    })
  }

  private   setFormHeader(): void {
    this.isUserAnAssessor$.pipe(first()).subscribe(isAssessor => {
      if (isAssessor) {
        this.formHeader = 'Review Secretary of State exemption certificate';
      } else {
        this.formHeader = 'Check your answers';
      }
    });
  }


  private generateReviewYourAnswersFieldConfigs(requestSoSCertificate: boolean): ReviewFieldConfig[] {
    const submissionFormId = this.route.snapshot.params['submissionFormId'];
    const changeLink = `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.REQUEST_SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE}`;

    return [
      {
        name: 'requestSoSCertificate',
        label: 'Do you want a SoS exemption certificate?',
        type: 'text',
        changeLink: changeLink,
        showChangeLink: true,
        value: this.trueFalsePipe.transform(requestSoSCertificate),
        ariaLabel: ChangeLinkAriaLabel.SOS_EXEMPTION_CERTIFICATE
      },
    ];
  }
}
