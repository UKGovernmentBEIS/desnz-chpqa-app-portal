import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TextLinkItem } from '@shared/interfaces/text-link-item.interface';
import { selectIsSubmissionNonEditable } from '@shared/store';
import { SchemeRegistartiondPath } from 'src/app/tasks/scheme-registration/models/scheme-registration-path.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-related-actions',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgClass, CommonModule],
  templateUrl: './related-actions.component.html',
  styleUrl: './related-actions.component.scss',
})
export class RelatedActionsComponent {
  isSubmissionNonEditable$ = this.store.select(selectIsSubmissionNonEditable);

  allActions: TextLinkItem[] = [
    // {
    //   text: 'Delegate responsibility',
    //   link: SchemeRegistartiondPath.BASE_PATH, //TODO: change this, when respective functionality has been finalized
    // },
    {
      text: 'Create a new scheme',
      link: `${SchemeRegistartiondPath.BASE_PATH}/${SchemeRegistartiondPath.BEFORE_REGISTRATION_STARTS}`,
    },
    //TODO
  ];
  @Input() relatedActions: TextLinkItem[] = this.allActions;

  constructor(
    protected route: ActivatedRoute,
    private store: Store<any>
  ) {}
}
