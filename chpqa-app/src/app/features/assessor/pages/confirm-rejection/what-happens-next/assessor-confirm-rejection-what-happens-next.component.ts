import { Component } from '@angular/core';
import { confirmRejectionCopy } from '../../../config/assessor-web-copy.config';
import { ActivatedRoute, Router } from '@angular/router';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';

@Component({
  selector: 'app-assessor-confirm-rejection-what-happens-next',
  standalone: true,
  templateUrl: './assessor-confirm-rejection-what-happens-next.component.html',
  styleUrls: ['./assessor-confirm-rejection-what-happens-next.component.scss'],
})
export class AssessorConfirmRejectionWhatHappensNextComponent {

  constructor(private router: Router, private route: ActivatedRoute){}
  
  // UI Translations for the page
  copy = confirmRejectionCopy.screen3;

  returnToDashboard(){
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.dashboard}`], {
      relativeTo: this.route,
    });
  }
}
