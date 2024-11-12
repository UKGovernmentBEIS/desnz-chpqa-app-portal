import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FORM_SUBMISSION_ROUTES } from './form-submission-routes';
import { F2FormEffects } from './f2-form/store/f2-form.effects';
import { F4FormEffects } from './f4-form/store/f4-form.effects';
import { FormSubmissionsEffects } from './store/form-submission.effects';
import { MeterEffects } from './f2-form/sub-tasks/meter-details/store/meter.effects';
import { PrimeMoverEffects } from './f2-form/sub-tasks/prime-mover/store/prime-mover.effects';
import * as formSubmission from '../form-submission/store';
import * as formPrimeMover from '../form-submission/f2-form/sub-tasks/prime-mover/store';
import * as formMeter from '../form-submission/f2-form/sub-tasks/meter-details/store';
import * as formF2Form from './f2-form/store';
import * as f4Form from './f4-form/store';
import * as formF4Form from './f4-form/store';
import { UncertaintyFactorsEffects } from './f4-form/sub-tasks/uncertainty-factors/state/uncertainty-factors.effects';
import { uncertaintyFactorsReducer } from './f4-form/sub-tasks/uncertainty-factors/state/uncertainty-factors.reducer';
import { HeatRejectionFacilityEffects } from './f2-form/sub-tasks/heat-rejection-facility/state/heat-rejection-facility.effects';
import { heatRejectionFacilityReducer } from './f2-form/sub-tasks/heat-rejection-facility/state/heat-rejection-facility.reducer';
import { BulkPerformanceDataEffects } from './f4-form/sub-tasks/bulk-performance-data/state/bulk-performance-data.effects';
import { bulkPerformanceDataReducer } from './f4-form/sub-tasks/bulk-performance-data/state/bulk-performance-data.reducer';
import { submitToAssessorReducer, SubmitToAssessorFeatureKey } from './f4-form/sub-tasks/submit/state';
import { SubmitToAssessorEffects } from './f4-form/sub-tasks/submit/state/submit-to-assessor.effects';
import { SchemeHistoryEffects } from './components/scheme-history/store/scheme-history.effects';
import { schemeHistoryReducer } from './components/scheme-history/store/scheme-history.reducer';
import { SchemeHistoryFeatureKey } from './components/scheme-history/store/scheme-history.selectors';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(FORM_SUBMISSION_ROUTES),
    StoreModule.forFeature(formSubmission.formSubmissionFeatureKey, formSubmission.reducer),
    StoreModule.forFeature(formF2Form.f2FormFeature),
    StoreModule.forFeature(f4Form.F4FormFeatureKey, f4Form.reducer),
    StoreModule.forFeature(formPrimeMover.primeMoverFeatureKey, formPrimeMover.reducer),
    StoreModule.forFeature(formMeter.meterFeatureKey, formMeter.reducer),
    StoreModule.forFeature(formF4Form.F4FormFeatureKey, formF4Form.reducer),
    StoreModule.forFeature('uncertaintyFactors', uncertaintyFactorsReducer),
    StoreModule.forFeature('bulkPerformanceData', bulkPerformanceDataReducer),
    StoreModule.forFeature('heatRejectionFacility', heatRejectionFacilityReducer),
    StoreModule.forFeature(SubmitToAssessorFeatureKey, submitToAssessorReducer),
    StoreModule.forFeature(SchemeHistoryFeatureKey, schemeHistoryReducer),
    EffectsModule.forFeature([
      BulkPerformanceDataEffects,
      F2FormEffects,
      F4FormEffects,
      FormSubmissionsEffects,
      PrimeMoverEffects,
      MeterEffects,
      F4FormEffects,
      UncertaintyFactorsEffects,
      HeatRejectionFacilityEffects,
      SubmitToAssessorEffects,
      SchemeHistoryEffects
    ]),
  ],
  providers: [],
})
export class FormSubmissionModule {}
