import { Component, Input, OnInit } from '@angular/core';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { tokenVerification } from '../../store';

@Component({
  selector: 'app-email-confirmation-success',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './email-confirmation-success.component.html',
  styleUrl: './email-confirmation-success.component.scss',
})
export class EmailConfirmationSuccessComponent implements OnInit {
  continuePath = `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.ENTER_RESPONSIBLE_PERSON}`;
  token: string;
  email: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];
    });
  }

  onContinue() {
    this.store.dispatch(
      tokenVerification({ token: this.token, email: this.email })
    );
  }
}
