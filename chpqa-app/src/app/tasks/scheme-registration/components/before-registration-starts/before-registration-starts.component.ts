import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SchemeRegistartiondPath } from '../../models/scheme-registration-path.model';
import { schemeRegistrationCopy } from '../../config/scheme-registration-copy-config';

@Component({
  selector: 'app-before-registration-starts',
  standalone: true,
  templateUrl: './before-registration-starts.component.html',
  styleUrl: './before-registration-starts.component.scss',
  imports: [RouterModule],
})
export class BeforeRegistrationStartsComponent {
  BACK = '/request-task-page';

  copy = schemeRegistrationCopy;

  constructor(private router: Router) {}

  onContinue() {
    this.router.navigate([
      SchemeRegistartiondPath.BASE_PATH,
      SchemeRegistartiondPath.ENTER_SCHEME_NAME,
    ]);
  }
}
