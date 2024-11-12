import { Component } from '@angular/core';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.scss',
})
export class TermsConditionsComponent {
  BACK = `../${RegistrationConfirmationPath.LEGAL_STATEMENT}`;
}
