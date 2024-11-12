import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { setInitialSchemeState, setSubmissionFormId } from '@shared/store';

export const canActivateTaskListPage: CanActivateFn = route => {
  const store = inject(Store);
  const submissionFormId = route.paramMap?.get('submissionFormId');

  if (submissionFormId) {
    store.dispatch(setSubmissionFormId({ submissionFormId }));
  } else {
    console.warn('No :submissionFormId param in route');
  }

  return true;
};

export const canDeactivateTaskListPage: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  if (!nextState.url.includes('assessor')) {
    const store = inject(Store);
    store.dispatch(setSubmissionFormId({ submissionFormId: null }));
    store.dispatch(setInitialSchemeState());
  }

  return true;
};
