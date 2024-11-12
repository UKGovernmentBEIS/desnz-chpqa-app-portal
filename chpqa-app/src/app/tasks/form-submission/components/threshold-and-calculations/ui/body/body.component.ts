import { Component, Input } from '@angular/core';
import { ThresholdDetailsBody } from 'src/app/tasks/form-submission/model/threshold-details.model';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [],
  templateUrl: './body.component.html',
})
export class BodyComponent {
  @Input({ required: true }) displayBody!: ThresholdDetailsBody;

  POWER_EFFICIENCY_CONDITIONS_MET = ThresholdDetailsBody.PowerEfficiencyConditionsMet;
  POWER_EFFICIENCY_CONDITIONS_NOT_MET = ThresholdDetailsBody.PowerEfficiencyConditionsNotMet;

  constructor() {}

}
