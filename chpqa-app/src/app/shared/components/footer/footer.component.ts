import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

type FooterLink = {
  title: string;
  hyperlink?: string;
  showAuthenticatedOnly: boolean;
  lang: string;
  href?: string;
  target?: string;
};

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule],
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  @Input() isAuthenticated: boolean;

  links: FooterLink[] = [
    { title: 'Guidance notes', href: 'https://www.gov.uk/guidance/chpqa-guidance-notes', showAuthenticatedOnly: false, lang: 'en', target: '_blank' },
    { title: 'Privacy', hyperlink: '/privacy', showAuthenticatedOnly: false, lang: 'en' },
    { title: 'Cookies', hyperlink: '/cookies', showAuthenticatedOnly: false, lang: 'en' },
    { title: 'Accessibility', hyperlink: '/accessibility', showAuthenticatedOnly: false, lang: 'en' },
    { title: 'Contact', hyperlink: '/contact', showAuthenticatedOnly: false, lang: 'en' },
  ];
}
