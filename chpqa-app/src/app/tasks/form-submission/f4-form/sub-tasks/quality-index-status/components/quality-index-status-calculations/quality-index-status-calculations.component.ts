import { Component, Input, OnInit } from '@angular/core';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { FormSubmission } from '@shared/models/form-submission.model';

@Component({
  selector: 'app-quality-index-status-calculations',
  standalone: true,
  imports: [],
  templateUrl: './quality-index-status-calculations.component.html',
})
export class QualityIndexStatusCalculationsComponent implements OnInit {
  @Input({ required: true }) formSubmission!: FormSubmission;

  F4_SIMPLE = SubmissionFormType.F4s;
  F4_COMPLEX = SubmissionFormType.F4;

  X!: number;
  Y!: number;
  power!: number;
  heat!: number;

  constructor() {}

  ngOnInit() {
    this.X = this.formSubmission.sumFnX;
    this.Y = this.formSubmission.sumFnY;
    this.power = this.formSubmission.powerEfficiency;
    this.heat = this.formSubmission.heatEfficiency;
  }
}
