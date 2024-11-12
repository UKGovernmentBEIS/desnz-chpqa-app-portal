import { Component, Input } from '@angular/core';
import { ThresholdDetailsCalculations } from 'src/app/tasks/form-submission/model/threshold-details.model';

@Component({
  selector: 'app-calculations',
  standalone: true,
  imports: [],
  templateUrl: './calculations.component.html',
})
export class CalculationsComponent {
  @Input({ required: true }) displayCalculations!: ThresholdDetailsCalculations;
  @Input({ required: true }) submissionForm!: any;

  F4_SIMPLE = ThresholdDetailsCalculations.F4Simple;
  F4_COMPLEX = ThresholdDetailsCalculations.F4Complex;

  constructor() {}

}
