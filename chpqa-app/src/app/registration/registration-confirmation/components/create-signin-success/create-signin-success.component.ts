import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { keycloakLogin } from 'src/app/auth/auth.actions';

@Component({
  selector: 'app-create-signin-success-container',
  standalone: true,
  imports: [CreateSigninSuccessComponent],
  template: ` <div class="govuk-grid-row govuk-!-margin-top-20">
    <div class="govuk-grid-column-two-thirds">
      <div class="govuk-panel govuk-panel--confirmation">
        <h1 class="govuk-panel__title">Account creation<br />complete</h1>
      </div>
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-full">
          <p class="govuk-body">
            We have sent you a confirmation email with your account details.
          </p>
          <h1 class="govuk-heading-m">What happens next</h1>
          <p class="govuk-body">
            When you sign in, we'll ask you to set up two-factor authentication
            to keep your account and data secure.
          </p>
          <button
            type="submit"
            class="govuk-button"
            data-module="govuk-button"
            routerLink="."
            (click)="login()">
            Continue to sign in
          </button>
        </div>
      </div>
    </div>
  </div>`,
})
export class CreateSigninSuccessComponent {
  constructor(private store: Store) {}

  login() {
    this.store.dispatch(
      keycloakLogin({
        redirectUri: location.origin + '/request-task-page',
      })
    );
  }
}
