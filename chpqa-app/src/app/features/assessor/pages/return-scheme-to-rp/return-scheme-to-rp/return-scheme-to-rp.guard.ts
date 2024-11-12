import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, of, switchMap, take } from 'rxjs';
import { AssessorFacade } from '../../../store/assessor.facade';
import { UserType } from '@shared/enums/user-type.enum';
import { selectUser } from 'src/app/auth/auth.selector';

export const canActivateReturnSchemeToRPPage: CanActivateFn = route => {
  const store = inject(Store);
  const assessorFacade = inject(AssessorFacade);

  return store.pipe(
    select(selectUser),
    map(user => user?.userType === UserType.AssessorAdmin),
    take(1),
    switchMap(isAssessorAdmin => {
        if(isAssessorAdmin){
            assessorFacade.returnToRP.dispatchActions.load();
            return of(true);
        }
        return of(false);
    })
  );
};
