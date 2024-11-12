import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assessor-provide-assessment-decision-scheme-certified',
  standalone: true,
  imports: [],
  templateUrl: './assessor-provide-assessment-decision-scheme-certified.component.html',
})
export class AssessorProvideAssessmentDecisionSchemeCertifiedComponent {
  constructor(private router: Router) {}


  onSubmit() {
    this.router.navigate(['/assessor/dashboard']);
  }
}
