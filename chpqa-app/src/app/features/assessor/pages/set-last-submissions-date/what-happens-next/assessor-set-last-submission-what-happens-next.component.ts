import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';
import { submitAssessmentCopy } from '../../../config/assessor-web-copy.config';
import { CommonModule } from '@angular/common';
import { AssessorFacade } from '../../../store/assessor.facade';

@Component({
  selector: 'app-assessor-set-last-submission-date-what-happens-next',
  standalone: true,
  templateUrl: './assessor-set-last-submission-what-happens-next.component.html',
  imports: [CommonModule, RouterModule],
})
export class AssessorSetLastSubmissionDateWhatHappensNextComponent {
  date$ = this.assessorFacade.setLastSubmissionDateFacade.stateObservables.selectUpdatedSubmissionDate$;

  constructor(private router: Router, private route: ActivatedRoute, private assessorFacade: AssessorFacade){
    
  }
  
  onReturnToDashboard(){
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.dashboard}`], {
      relativeTo: this.route,
    });
  }

}
