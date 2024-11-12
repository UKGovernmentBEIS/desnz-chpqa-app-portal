import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, first, map, Observable, take } from 'rxjs';
import { ReviewAnswersComponent } from '@shared/components/review-answers/review-answers.component';
import { FinancialBenefitsFacade } from '../../state/financial-benefits.facade';
import { FinancialBenefitsService } from '../../services/financial-benefits.service';
import { ReviewFieldConfig } from '@shared/models/field-config.model';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { Status } from '@shared/enums/status.enum';
import { SharedFacade } from '@shared/store';
import { NavigationService } from '@shared/services/navigation.service';

@Component({
  selector: 'app-financial-benefits-summary',
  standalone: true,
  imports: [CommonModule, ReviewAnswersComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  providers: [FinancialBenefitsFacade, FinancialBenefitsService],
})
export class FinancialBenefitsSummaryComponent {
  backButton$: Observable<string> = this.financialBenefitFacade.sectionStatus$.pipe(
    map((status: Status) => {
      if (status === Status.Completed) {
        return `../${FormSubmissionPath.TASK_LIST}`;
      } else {
        return `../${FormSubmissionPath.FINANCIAL_BENEFITS}`;
      }
    })
  );

  reviewScreenValues: ReviewFieldConfig[] = [];
  financialBenefitsData$ = this.financialBenefitFacade.selectFinancialBenefits$;
  submissionForm$ = this.financialBenefitFacade.submissionForm$;
  financialBenefitsFormInputs$ = this.financialBenefitFacade.financialBenefitsFormInputs$;
  financialBenefitsSectionStatus$ = this.financialBenefitFacade.sectionStatus$;

  private isSubmissionNonEditable: boolean;

  constructor(
    private financialBenefitFacade: FinancialBenefitsFacade,
    private financialBenefitsService: FinancialBenefitsService,
    private nagivationService: NavigationService,
    private sharedFacade: SharedFacade
  ) {}

  ngOnInit(): void {
    this.financialBenefitsDataForReview();

    this.sharedFacade.isSubmissionNonEditable()
      .pipe(take(1))
      .subscribe(
        nonEditable => this.isSubmissionNonEditable = nonEditable
      );
  }

  financialBenefitsDataForReview(): void {
    combineLatest([this.financialBenefitsData$, this.financialBenefitsFormInputs$, this.submissionForm$])
      .pipe(first())
      .subscribe(([financialBenefitsData, formInputs, submissionForm]) => {
        const financialBenefits = financialBenefitsData ?? submissionForm;

        this.reviewScreenValues = this.financialBenefitsService.generateFinancialBenefitsFieldConfigs(financialBenefits, formInputs, null);
      });
  }

  handleFormSubmitted(event: any): void {
    this.isSubmissionNonEditable
      ? this.nagivationService.navigateToTaskList()
      : this.financialBenefitFacade.submitFinancialBenefits();
  }
}
