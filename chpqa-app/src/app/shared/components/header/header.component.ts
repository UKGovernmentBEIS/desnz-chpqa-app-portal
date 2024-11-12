import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CookiesPopUpContainerComponent } from '../cookies-pop-up/cookies-pop-up-container.component';
import { CommonModule } from '@angular/common';
import { keycloakLogout, login } from 'src/app/auth/auth.actions';
import { selectEmail, selectUser } from 'src/app/auth/auth.selector';
import { Observable, first, map, of, skip, switchMap, takeWhile } from 'rxjs';
import { SharedFacade } from '@shared/store';
import { Router } from '@angular/router';
import { UserType } from '@shared/enums/user-type.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CookiesPopUpContainerComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent  implements OnInit, OnDestroy {
  @Input() isAuthenticated: boolean;
  email$: Observable<any> = this.store.select(selectEmail);
  isUserAnAssessorAdmin$ = this.store.pipe(
    select(selectUser),
    map(user => user?.userType === UserType.AssessorAdmin)
  );

  isAnAssessor = false;
  isComponentAlive = true;
  constructor( private router: Router, private store: Store, private sharedFacade: SharedFacade) {}

  ngOnInit() {
    this.email$
      .pipe(
        skip(1),
        first(),
        switchMap((email: string) => of(this.store.dispatch(login({ email }))))
      )
      .subscribe();
      this.sharedFacade
      .isUserAnAssessor()
      .pipe(takeWhile(() => this.isComponentAlive))
      .subscribe(isAnAssessor => {
        this.isAnAssessor = isAnAssessor;
      });
  }

  logout() {
    this.store.dispatch(keycloakLogout({ redirectUri: location.origin }));
  }

  onSchemeListClick(){
    if (this.isAnAssessor ) {
      this.router.navigate(['/assessor']);
    } 
    else {
      this.router.navigate(['/request-task-page']);
    }

  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
