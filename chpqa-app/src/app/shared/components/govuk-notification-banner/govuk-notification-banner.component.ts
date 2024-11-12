import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-govuk-notification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govuk-notification-banner.component.html',
  styleUrl: './govuk-notification-banner.component.scss'
})
export class GovukNotificationBannerComponent {
  @Input() isSuccess: boolean = false;
  @Input() text: string;
}
