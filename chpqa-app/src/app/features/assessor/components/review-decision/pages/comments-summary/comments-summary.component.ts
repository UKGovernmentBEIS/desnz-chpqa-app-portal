import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReplySubmissionGroupCommentsTA1 } from 'src/app/api-services/chpqa-api/generated';
import { FormSubmissionPath } from 'src/app/tasks/form-submission/model/form-submission-path.model';
import { setSubmissionGroupIdAndNavigate } from 'src/app/tasks/form-submission/store';

@Component({
  selector: 'app-comments-summary',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './comments-summary.component.html',
  styleUrl: './comments-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsSummaryComponent {
  @Input() basePath: string;
  @Input() formCaption: string;
  @Input() formHeader: string;
  @Input() description1: string;
  @Input() description2: string;
  @Input() subheading: string;
  @Input() comments: ReplySubmissionGroupCommentsTA1[];
  @Input() textButton = 'Change';
  @Input() latestSubmissionStatus: number;

  constructor(private store: Store) {}

  getBackLink(): string {
    return `${this.basePath}/${FormSubmissionPath.TASK_LIST}`;
  }

  dispatchAndNavigate(field: any): any {
    this.store.dispatch(setSubmissionGroupIdAndNavigate({ id: field.id, groupType: field.groupType }));
  }
  
}