import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { returnSchemeToRPWebCopy } from '../../../config/assessor-web-copy.config';
import { ASSESSOR_ROUTE_PATHS } from '../../../config/assessor-routes.config';

@Component({
  selector: 'app-what-happens-next',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './what-happens-next.component.html',
  styleUrl: './what-happens-next.component.scss'
})
export class WhatHappensNextComponent {
  constructor(private router: Router, private route: ActivatedRoute){}
  
  // UI Translations for the page
  copy = returnSchemeToRPWebCopy.screen3;

  returnToDashboard(){
    this.router.navigate([`../../${ASSESSOR_ROUTE_PATHS.dashboard}`], {
      relativeTo: this.route,
    });
  }
}
