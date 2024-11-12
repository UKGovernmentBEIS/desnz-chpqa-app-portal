import { CommonModule } from '@angular/common';
import { Component, ContentChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';

@Component({
  selector: 'app-threshold-calculations',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './threshold-and-calculations.component.html',
})
export class ThresholdAndCalculationsComponent {
  back = `../${FormSubmissionPath.TASK_LIST}`;
  
  @ContentChild('caption') captionTemplate!: TemplateRef<any>;
  @ContentChild('header') headerTemplate!: TemplateRef<any>;
  @ContentChild('body') bodyTemplate!: TemplateRef<any>;
  @ContentChild('threshold') thresholdTemplate!: TemplateRef<any>;
  @ContentChild('calculations') calculationsTemplate!: TemplateRef<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onContinue() {
    this.router.navigate([`../${FormSubmissionPath.TASK_LIST}`], {
      relativeTo: this.route,
    });
  }

}
