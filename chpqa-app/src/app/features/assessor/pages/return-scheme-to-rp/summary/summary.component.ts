import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Observable, takeWhile } from 'rxjs';
import { selectSectionStatus } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { returnSchemeToRPWebCopy } from '../../../config/assessor-web-copy.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { RemoteData } from 'ngx-remotedata';
import { HttpErrorResponse } from '@angular/common/http';
import { ReviewAnswersComponent } from '../../../../../shared/components/review-answers/review-answers.component';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AssessorStatus } from '@shared/enums/status.enum';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [AsyncPipe, ReviewAnswersComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  backButton = `../../${ASSESSOR_ROUTE_PATHS.returnToRP.reasonForReturningScheme}`;

  confirmReturnToRP$: Observable<RemoteData<any[], HttpErrorResponse>> = this.assessorFacade.returnToRP.stateObservables.response$;
  reasonForReturningScheme$ = this.assessorFacade.returnToRP.stateObservables.reasonForReturningScheme$;
  reasonForReturningSchemeStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.ReturnSchemeToRpFromAA)));

  copy = returnSchemeToRPWebCopy.screen2;
  isComponentAlive = true;
  reviewScreenValues: ReviewFieldConfig[] = [];
  StatusEnum = AssessorStatus;
  reasonForReturningSchemeStatus = null;

  constructor(
    private router: Router,
    private readonly store: Store,
    private assessorFacade: AssessorFacade
  ) {}

  ngOnInit(): void {
    this.assessorFacade.showLoadingSpinnerForApiResponses(this.confirmReturnToRP$ as any, this.isComponentAlive);
    this.reasonForReturningScheme$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(reasonForReturningScheme => {
      this.reviewScreenValues.push({
        name: 'Return scheme to Responsible Person',
        label: 'Check your answers',
        type: 'text',
        value: reasonForReturningScheme,
        showChangeLink: true,
        changeLink: this.backButton,
        ariaLabel: ChangeLinkAriaLabel.DEFAULT,
      });
    });
    this.reasonForReturningSchemeStatus$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(reasonForReturningSchemeStatus => {
      this.reasonForReturningSchemeStatus = reasonForReturningSchemeStatus;
    });
  }

  handleFormSubmitted() {
    if ( this.reasonForReturningSchemeStatus !== this.StatusEnum.Completed ) {
      this.assessorFacade.returnToRP.dispatchActions.confirmReturnToRP();
    } else {
      this.router.navigate(['/assessor/dashboard']);
    }
  }
}
