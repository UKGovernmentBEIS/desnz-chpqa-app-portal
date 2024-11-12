import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DynamicFormErrorsSummaryComponent } from '@shared/components/dynamic-form-builder/components/dynamic-form-errors-summary';
import { GovukTextareaInputComponent } from '@shared/components/form-controls/govuk-textarea-input/govuk-textarea-input.component';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { AssessorFacade } from '../../../store/assessor.facade';
import { Store } from '@ngrx/store';
import { selectSubmissionFormId } from '@shared/store';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { map, takeWhile } from 'rxjs';
import { returnSchemeToRPWebCopy } from '../../../config/assessor-web-copy.config';

@Component({
  selector: 'app-return-scheme-to-rp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GovukTextareaInputComponent, DynamicFormErrorsSummaryComponent],
  templateUrl: './return-scheme-to-rp.component.html',
  styleUrl: './return-scheme-to-rp.component.scss',
})
export class ReturnSchemeToRpComponent {
  backButton$ = this.store.select(selectSubmissionFormId).pipe(
    map(submissionFormId => {
      return `${FormSubmissionPath.BASE_PATH}/${submissionFormId}/${FormSubmissionPath.TASK_LIST}`;
    })
  );

  reasonForReturningScheme$ = this.assessorFacade.returnToRP.stateObservables.reasonForReturningScheme$;

  copy = returnSchemeToRPWebCopy.screen1;
  isComponentAlive = true;
  form: FormGroup;
  validationMessages = {
    reasonForReturningScheme: {
      required: 'Select a reason for returning scheme',
    },
  };

  formUpdated = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private assessorFacade: AssessorFacade,
    private readonly fb: FormBuilder,
    private store: Store
  ) {
    this.form = this.fb.group({
      reasonForReturningScheme: [null, [Validators.required]],
    });
  }

  
  ngOnInit(): void {
    this.assessorFacade.showLoadingSpinnerForApiResponses(this.reasonForReturningScheme$ as any, this.isComponentAlive);
    this.assessorFacade.returnToRP.stateObservables.reasonForReturningScheme$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(reasonForReturningScheme => {
      this.form.patchValue({
        reasonForReturningScheme,
      });
    });
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  onContinue() {
    if (this.form.valid) {
      this.assessorFacade.returnToRP.dispatchActions.setReasonForReturningScheme(this.form.getRawValue().reasonForReturningScheme);
      this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.returnToRP.summary}`], {
        relativeTo: this.route,
      });
    }
  }

}
