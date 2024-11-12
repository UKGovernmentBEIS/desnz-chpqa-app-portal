import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { selectFormState } from '@shared/store';
import { selectFinancialBenefits, selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { FinancialBenefits } from '../config/financial-benefits.model';
import { FinancialBenefitsSharedStateFormEnum } from '../config/financial-benefits.config';
import { submitFinancialBenefits } from 'src/app/tasks/form-submission/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';

@Injectable()
export class FinancialBenefitsFacade {
  selectFinancialBenefits$: Observable<FinancialBenefits> = this.store.pipe(select(selectFinancialBenefits));
  submissionForm$ = this.store.pipe(select(selectSubmissionForm));
  financialBenefitsFormInputs$ = this.store.pipe(select(selectFormState(FinancialBenefitsSharedStateFormEnum.FinancialBenefitsFormInputs)));
  sectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.ProvideInformationFinancialBenefits)));

  constructor(
    private store: Store<any>,
    private spinner: NgxSpinnerService
  ) {}

  submitFinancialBenefits(): void {
    this.store.dispatch(submitFinancialBenefits());
  }
}
