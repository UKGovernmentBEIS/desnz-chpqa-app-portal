import { Component } from '@angular/core';
import { returnSchemeCopy } from '../../../config/assessor-web-copy.config';
import { ActivatedRoute, Router } from '@angular/router';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';

@Component({
  selector: 'app-assessor-return-to-rp-what-happens-next',
  standalone: true,
  templateUrl: './assessor-return-to-rp-what-happens-next.component.html',
  styleUrls: ['./assessor-return-to-rp-what-happens-next.component.scss'],
})
export class AssessorReturnToRPWhatHappensNextComponent {
  copy = returnSchemeCopy;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit() {
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.dashboard}`], {
      relativeTo: this.route,
    });
  }
}
