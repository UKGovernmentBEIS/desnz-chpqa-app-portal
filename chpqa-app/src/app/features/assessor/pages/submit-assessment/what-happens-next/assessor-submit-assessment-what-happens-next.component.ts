import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { submitAssessmentCopy } from '../../../config/assessor-web-copy.config';
import { CommonModule } from '@angular/common';
import { AssessorFacade } from '../../../store/assessor.facade';

@Component({
  selector: 'app-assessor-submit-assessment-what-happens-next',
  standalone: true,
  templateUrl: './assessor-submit-assessment-what-happens-next.component.html',
  styleUrls: ['./assessor-submit-assessment-what-happens-next.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class AssessorSubmitAssessmentWhatHappensNextComponent {
  
  constructor(private router: Router, private route: ActivatedRoute, private assessorFacade: AssessorFacade){}
  
  // UI Translations for the page
  copy = submitAssessmentCopy.screen3;

  returnToDashboard(){
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.dashboard}`], {
      relativeTo: this.route,
    });
  }

}
