import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { Status } from '@shared/enums/status.enum';
import { isInProgress, RemoteData } from 'ngx-remotedata';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Observable, takeUntil } from 'rxjs';
import { selectSectionStatus, selectHeatRejectionFacility } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { HeatRejectionFacility } from '../config/heat-rejection-facility.model';
import { HeatRejectionFacilityActions } from './heat-rejection-facility.actions';
import { selectFormState } from '@shared/store';
import { HeatRejectionFacilitySharedStateFormEnum } from '../config/heat-rejection-facility.config';
import { HeatRejectionFacilitySelectors } from './heat-rejection-facility.selectors';

@Injectable()
export class HeatRejectionFacilityFacade {
  selectHeatRejectionFacility$ = this.store.pipe(select(selectHeatRejectionFacility));
  apiUpdateHeatRejectionFacilityPost$ = this.store.pipe(
    select(HeatRejectionFacilitySelectors.selectApiUpdateHeatRejectionFacilityPost)
  );
  heatRejectionFacilitySectionStatus$: Observable<Status> = this.store.pipe(select(selectSectionStatus(SubmissionGroupType.AddHeatRejectionFacilityDetails)));

  heatRejectionFacilityFormInputs$ = this.store.select(
    selectFormState(HeatRejectionFacilitySharedStateFormEnum.HeatRejectionFacilityFormInputs)
  );

  constructor(
    private store: Store<any>,
    private spinner: NgxSpinnerService
  ) {}

  setHeatRejectionFacility(): void {
    this.store.dispatch(HeatRejectionFacilityActions.setHeatRejectionFacility());
  }

  setHeatRejectionFacilitySectionAsComplete(payload: any): void {
    this.store.dispatch(HeatRejectionFacilityActions.setHeatRejectionFacilityAsComplete({ payload }));
  }

  showLoadingSpinnerForApiResponses<T>(observables: Observable<RemoteData<T, HttpErrorResponse>>[], unsubscribe$: Observable<void>): void {
    combineLatest(observables)
      .pipe(takeUntil(unsubscribe$))
      .subscribe(responses => {
        if (responses.some(response => isInProgress(response))) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });
  }
}
