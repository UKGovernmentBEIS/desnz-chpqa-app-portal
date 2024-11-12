import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RegistrationRequestPath } from '../../models/registration-request-path.model';

@Component({
  selector: 'app-create-sign-in',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './create-sign-in.component.html',
  styleUrl: './create-sign-in.component.scss',
})
export class CreateSignInComponent {
  BACK = `/landing`;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onContinue() {
    this.router.navigate([RegistrationRequestPath.REGISTRATION_EMAIL], {
      relativeTo: this.route,
      skipLocationChange: true,
    });
  }
}
