import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ThresholdDetailsHeader } from 'src/app/tasks/form-submission/model/threshold-details.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input({ required: true }) displayHeader!: ThresholdDetailsHeader;

  POWER_EFFICIENCY_CONDITIONS_MET = ThresholdDetailsHeader.PowerEfficiencyConditionsMet;
  POWER_EFFICIENCY_CONDITIONS_NOT_MET = ThresholdDetailsHeader.PowerEfficiencyConditionsNotMet;

  constructor() {}

}
