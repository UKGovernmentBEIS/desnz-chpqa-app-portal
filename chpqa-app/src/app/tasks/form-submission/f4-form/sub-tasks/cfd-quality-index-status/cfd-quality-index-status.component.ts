import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormSubmission } from '@shared/models/form-submission.model';
import { Observable, tap } from 'rxjs';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { selectSubmissionForm } from 'src/app/tasks/form-submission/store/form-submission.selectors';

@Component({
  selector: 'app-cfd-quality-index-status',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './cfd-quality-index-status.component.html',
})
export class CfdQualityIndexStatusComponent {
  BACK = `../${FormSubmissionPath.TASK_LIST}`;

  vm$: Observable<FormSubmission> = this.store.select(selectSubmissionForm).pipe(
    tap(formSubmission => {
      this.X = formSubmission.rocscfdSumFnX;
      this.Y = formSubmission.rocscfdsumFnY;
      this.power = formSubmission.powerEfficiency;
      this.heat = formSubmission.heatEfficiency;
    })
  );

  X?: number;
  Y?: number;
  power?: number;
  heat?: number;

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
