import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GovukDateInputComponent } from '@shared/components/form-controls/govuk-date-input/govuk-date-input.component';
import { take } from 'rxjs';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { AssessorFacade } from '../../../store/assessor.facade';

@Component({
  selector: 'app-assessor-set-last-submission-date-enter-final-date',
  standalone: true,
  templateUrl: './assessor-set-last-submission-enter-final-date.component.html',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, GovukDateInputComponent],
  providers: [FormGroupDirective],
})
export class AssessorSetLastSubmissionDateEnterFinalDateComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private assessorFacade: AssessorFacade
  ) {}

  ngOnInit() {
    this.assessorFacade.setLastSubmissionDateFacade.stateObservables.selectUpdatedSubmissionDate$.pipe(take(1)).subscribe(data => {
      this.form = this.fb.group({
        submissionDate: [data ?? null, Validators.required],
      });
    });
  }

  onContinue() {
    if (this.form.valid) {
      const submissionDate = this.form.get('submissionDate').value;
      this.assessorFacade.setLastSubmissionDateFacade.dispatchActions.updateSubmissionDate(submissionDate);
      this.router.navigate([`/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.checkYourAnswers}`]);
    } else {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        this.form.markAllAsTouched();
        return;
      }
    }
  }

  goBack(): void {
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.dashboard}`], {
      relativeTo: this.route,
    });
  }
}
