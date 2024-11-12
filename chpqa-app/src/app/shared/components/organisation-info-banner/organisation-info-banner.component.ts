import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-organisation-info-banner',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './organisation-info-banner.component.html',
  styleUrl: './organisation-info-banner.component.scss'
})
export class OrganisationInfoBannerComponent {
  @Input() readonly organisationName: string;
  @Input() readonly siteName: string;
  @Input() readonly schemeName: string;

  constructor() { }
  
}
