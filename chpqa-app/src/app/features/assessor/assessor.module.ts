import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AssessorEffects } from './store/assessor.effects';
import { AssessorRoutingModule } from './assessor-routing.module';
import { assessorReducer } from './store/assessor.reducer';
import { reviewDecisionReducer } from './components/review-decision/store/review-decision.reducer';
import { ReviewDecisionEffects } from './components/review-decision/store/review-decision.effects';

@NgModule({
  imports: [
    CommonModule,
    AssessorRoutingModule,
    // For now moved the state to root level
    // StoreModule.forFeature('assessor', assessorReducer),
    // StoreModule.forFeature('reviewDecision', reviewDecisionReducer),
    // EffectsModule.forFeature([
    //   AssessorEffects,
    //   ReviewDecisionEffects
    // ])
  ],
})
export class AssessorModule {}
