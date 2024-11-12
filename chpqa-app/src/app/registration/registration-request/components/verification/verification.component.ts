import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { RegistrationRequestPath } from '../../models/registration-request-path.model';
import { selectEmail } from '../../store';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss',
})
export class VerificationComponent {
  BACK = `../` + RegistrationRequestPath.REGISTRATION_EMAIL;

  email$ = this.store.select(selectEmail);

  constructor(private readonly store: Store) {}
}
