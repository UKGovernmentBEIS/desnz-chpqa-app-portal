import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { isComplex, selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { combineLatest, map } from 'rxjs';
import { ThresholdDetails, ThresholdDetailsBody, ThresholdDetailsCalculations, ThresholdDetailsHeader } from '../../../model/threshold-details.model';
import { ThresholdAndCalculationsComponent } from '../../../components/threshold-and-calculations/threshold-and-calculations.component';
import { BodyComponent } from '../../../components/threshold-and-calculations/ui/body/body.component';
import { CalculationsComponent } from '../../../components/threshold-and-calculations/ui/calculations/calculations.component';
import { HeaderComponent } from '../../../components/threshold-and-calculations/ui/header/header.component';

@Component({
  selector: 'app-power-efficiency-threshold',
  standalone: true,
  imports: [CommonModule, RouterModule, ThresholdAndCalculationsComponent, HeaderComponent, BodyComponent, CalculationsComponent],
  templateUrl: './power-efficiency-threshold.component.html',
})
export class PowerEfficiencyThresholdComponent {
  submissionForm$ = this.store.select(selectSubmissionForm);
  isComplex$ = this.store.select(isComplex);
  vm$ = combineLatest([this.submissionForm$, this.isComplex$]).pipe(
    map(([submissionForm, isComplex]) => {
      const conditionsAreMet = submissionForm.powerEfficiency >= submissionForm.powerEfficiencyThreshold;
      let displayTemplate: ThresholdDetails;

      if (conditionsAreMet) {
        displayTemplate = {
          header: ThresholdDetailsHeader.PowerEfficiencyConditionsMet,
          body: ThresholdDetailsBody.PowerEfficiencyConditionsMet,
        };
      } else {
        displayTemplate = {
          header: ThresholdDetailsHeader.PowerEfficiencyConditionsNotMet,
          body: ThresholdDetailsBody.PowerEfficiencyConditionsNotMet,
        };
      }

      if (isComplex) {
        displayTemplate = {
          ...displayTemplate,
          calculations: ThresholdDetailsCalculations.F4Complex,
        };
      } else {
        displayTemplate = {
          ...displayTemplate,
          calculations: ThresholdDetailsCalculations.F4Simple,
        };
      }

      return {
        submissionForm,
        displayTemplate,
      };
    })
  );

  constructor(private store: Store) {}
}
