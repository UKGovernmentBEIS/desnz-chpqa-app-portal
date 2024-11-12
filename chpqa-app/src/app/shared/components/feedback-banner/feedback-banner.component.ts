import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserFacade } from 'src/app/auth/user.facade';

@Component({
  selector: 'app-feedback-banner',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './feedback-banner.component.html',
  styleUrl: './feedback-banner.component.scss'
})
export class FeedbackBannerComponent {
  fullName$ = this.userFacade.userFullName$;

  constructor(
    private userFacade: UserFacade
  ) {}

}
