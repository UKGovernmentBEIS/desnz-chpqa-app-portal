import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { selectFullName } from './auth.selector';

@Injectable({
  providedIn: 'root',
})
export class UserFacade {
  userFullName$ = this.store.select(selectFullName).pipe(filter(fullName => !!fullName));

  constructor(private store: Store) {}
}
