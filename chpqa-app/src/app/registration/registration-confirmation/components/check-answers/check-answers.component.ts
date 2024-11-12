import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { RegistrationConfirmationPath } from '../../models/registration-confirmation-path.model';
import { selectRegisteredResponsiblePerson, submitResponsiblePerson } from '../../store';
import { ChangeLinkAriaLabel } from '@shared/enums/aria-label.enum';

@Component({
  selector: 'app-check-answers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './check-answers.component.html',
  styleUrl: './check-answers.component.scss',
})
export class CheckAnswersComponent {
  BACK = '../' + RegistrationConfirmationPath.LEGAL_STATEMENT;
  ENTER_RESPONSIBLE_PERSON = `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.ENTER_RESPONSIBLE_PERSON}`;
  CHOOSE_PASSWORD = `${RegistrationConfirmationPath.BASE_PATH}/${RegistrationConfirmationPath.CHOOSE_PASSWORD}`;

  responsiblePerson$ = this.store.select(selectRegisteredResponsiblePerson);

  ChangeLinkAriaLabel = ChangeLinkAriaLabel;
  constructor(private store: Store) {}

  submitClick() {
    this.store.dispatch(submitResponsiblePerson());
  }
}
