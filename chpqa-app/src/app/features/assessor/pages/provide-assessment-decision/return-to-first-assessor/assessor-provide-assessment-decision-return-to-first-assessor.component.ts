import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assessor-provide-assessment-decision-return-to-first-assessor',
  standalone: true,
  imports: [],
  templateUrl: './assessor-provide-assessment-decision-return-to-first-assessor.component.html',
})
export class AssessorProvideAssessmentDecisionReturnToFirstAssessorComponent {
  constructor(private router: Router) {}


  onSubmit() {
    this.router.navigate(['/assessor/dashboard']);
  }
}
