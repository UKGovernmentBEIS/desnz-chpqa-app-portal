import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormSubmission } from '@shared/models/form-submission.model';
import { Observable } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';
import { QualityIndexStatusCalculationsComponent } from '../quality-index-status-calculations/quality-index-status-calculations.component';

@Component({
  selector: 'app-show-quality-index-status',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    QualityIndexStatusCalculationsComponent
  ],
  templateUrl: './show-quality-index-status.component.html',
})
export class QualityIndexStatusComponent {
  BACK = `../${FormSubmissionPath.TASK_LIST}`;

  vm$: Observable<FormSubmission> = this.store.select(selectSubmissionForm);
  
  constructor(
    private readonly store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onConfirm() {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }
}
