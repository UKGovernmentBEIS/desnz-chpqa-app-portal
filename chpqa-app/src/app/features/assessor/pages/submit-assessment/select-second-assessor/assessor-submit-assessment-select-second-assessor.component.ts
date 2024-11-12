import { Component } from '@angular/core';
import { submitAssessmentCopy } from '../../../config/assessor-web-copy.config';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { HttpErrorResponse } from '@angular/common/http';
import { RemoteData } from 'ngx-remotedata';
import { Observable, takeWhile } from 'rxjs';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AssessorFacade } from '../../../store/assessor.facade';
import { CommonModule } from '@angular/common';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukSelectInputComponent } from '@shared/components/form-controls/govuk-select-input/govuk-select-input.component';

@Component({
  selector: 'app-assessor-submit-assessment-select-second-assessor',
  standalone: true,
  templateUrl: './assessor-submit-assessment-select-second-assessor.component.html',
  styleUrls: ['./assessor-submit-assessment-select-second-assessor.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GovukSelectInputComponent, DynamicFormErrorsSummaryComponent],
})
export class AssessorSubmitAssessmentSelectSecondAssessorComponent {
  backButton = `../../${ASSESSOR_ROUTE_PATHS.submitAssessment.commentsToSecondAssessor}`;
  assessorsListResponse$: Observable<RemoteData<any[], HttpErrorResponse>> = this.assessorFacade.sharedFacade.stateObservables.secondAssessorsList$; //TODO fix any

  // UI Translations for the page
  copy = submitAssessmentCopy.screen2;

  isComponentAlive = true;
  form: FormGroup;
  validationMessages = {
    assessor: {
      required: 'Choose a second assessor',
    },
  };

  formUpdated = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private assessorFacade: AssessorFacade
  ) {
    this.form = this.fb.group({
      secondAssessor: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.assessorFacade.showLoadingSpinnerForApiResponses(this.assessorsListResponse$ as any, this.isComponentAlive);
    this.assessorFacade.sharedFacade.dispatchActions.loadSecondAssessorsList(null);
    this.assessorFacade.sharedFacade.stateObservables.selectSchemeSecondAssessorId$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(secondAssessor => {
      this.form.patchValue({
        secondAssessor,
      });
    });
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  onContinue() {
    if (this.form.valid) {
      this.assessorFacade.submitAssessmentFacade.dispatchActions.load(this.form.getRawValue().secondAssessor.id);
      this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.submitAssessment.whatHappensNext}`], {
        relativeTo: this.route,
      });
    }
  }
}
