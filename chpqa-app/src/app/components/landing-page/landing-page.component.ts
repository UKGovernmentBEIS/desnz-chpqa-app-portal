import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { getUserRole, selectIsUserAnAssessor } from '@shared/store';
import { take } from 'rxjs';
import { keycloakLogin } from 'src/app/auth/auth.actions';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  isUserAnAssessor$ = this.store.pipe(select(selectIsUserAnAssessor));
  constructor(
    private store: Store,
    public readonly authService: AuthService
  ) {}

  login() {
    this.isUserAnAssessor$.pipe(take(1)).subscribe((isUserAnAssessor: boolean) => {
      if (isUserAnAssessor) {
        this.store.dispatch(
          keycloakLogin({
            redirectUri: location.origin + '/assessor',
          })
        );
      } else {
        this.store.dispatch(
          keycloakLogin({
            redirectUri: location.origin + '/request-task-page',
          })
        );
      }
    });
  }
}
