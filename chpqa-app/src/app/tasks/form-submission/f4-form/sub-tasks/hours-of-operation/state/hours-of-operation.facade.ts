import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HoursOfOperation } from '../config/hours-of-operation.model';
import { select, Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { selectHoursOfOperation } from './hours-of-operation.selectors';
import { selectFormState } from '@shared/store';
import { HoursOfOperationSharedStateFormEnum } from '../config/hours-of-operation.config';
import { selectSectionStatus, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { setHoursOfOperation, submitHoursOfOperation } from '../../../store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { HoursOfOperationDataModel } from '../../../models/f4-form.model';

@Injectable()
export class HoursOfOperationFacade {
  selectHoursOfOperation$: Observable<HoursOfOperation> = this.store.pipe(select(selectHoursOfOperation));
  submissionForm$ = this.store.pipe(select(selectSubmissionForm));
  hoursOfOperationFormInputs$ = this.store.pipe(select(selectFormState(HoursOfOperationSharedStateFormEnum.HoursOfOperationFormInputs)));
  sectionStatus$ = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.ProvideHoursOfOperation)));

  constructor(
    private store: Store<any>,
    private spinner: NgxSpinnerService
  ) {}

  setHoursOfOperationState(hoursOfOperation: HoursOfOperationDataModel): void {
    this.store.dispatch(setHoursOfOperation({ payload: hoursOfOperation }));
  }

  submitHoursOfOperation(): void {
    this.store.dispatch(submitHoursOfOperation());
  }
}
