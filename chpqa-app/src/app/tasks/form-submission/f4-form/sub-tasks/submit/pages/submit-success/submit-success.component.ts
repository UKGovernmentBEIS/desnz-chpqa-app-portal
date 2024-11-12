import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WEB_COPY_SUBMIT_SUCCESS } from '../../config/submit.web-copy';

@Component({
  selector: 'app-submit-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './submit-success.component.html',
  styleUrl: './submit-success.component.scss',
})
export class SubmitSuccessComponent {
  webCopy = WEB_COPY_SUBMIT_SUCCESS;
  constructor(private router: Router) {}

  onClick() {
    this.router.navigate(['request-task-page'], {
      skipLocationChange: true,
    });
  }
}
