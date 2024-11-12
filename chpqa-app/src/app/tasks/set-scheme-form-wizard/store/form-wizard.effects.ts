import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as FormWizardActions from './form-wizard.actions';
import { FormWizardPath } from '../models/form-wizard-path.model';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  navigateTo,
  selectSelectedScheme,
  setSubmissionFormId,
} from '@shared/store';
import { FormSubmissionService } from '@shared/services/form-submission.service';
import { SubmissionFormType } from '@shared/enums/form-submission.enum';
import { FormSubmissionPath } from '../../form-submission/model/form-submission-path.model';
import { FormSubmission } from '@shared/models/form-submission.model';
import { RequestReturnId } from 'src/app/api-services/chpqa-api/generated';

@Injectable()
export class FormWizardEffects {
  setIsOperational$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FormWizardActions.setIsOperational),
      withLatestFrom(this.store.select(selectSelectedScheme)),
      switchMap(([action, scheme]) => {
        const url = action.isOperational
          ? `${FormWizardPath.BASE_PATH}/${scheme.id}/${FormWizardPath.CHOOSE_CRITERIA}`
          : `${FormWizardPath.BASE_PATH}/${scheme.id}/${FormWizardPath.ROUTE_FOR_F3}`;

        return of(navigateTo({ url: url }));
      })
    );
  });

  setMeetsCriteria$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FormWizardActions.setMeetsCriteria),
      withLatestFrom(this.store.select(selectSelectedScheme)),
      switchMap(([action, scheme]) => {
        const meetsCriteria = action.meetsCriteria;
        let formSubmission: FormSubmission;

        if (meetsCriteria) {
          formSubmission = {
            submissionFormType: SubmissionFormType.F4s,
            name: `Submission for F4s for scheme ${scheme.name}`,
            year: new Date().getFullYear().toString(),
            version: '1',
            scheme: { ...scheme },
          };
        } else {
          formSubmission = {
            submissionFormType: SubmissionFormType.F4,
            name: `Submission for F4 for scheme ${scheme.name}`,
            year: new Date().getFullYear().toString(),
            version: '1',
            scheme: { ...scheme },
          };
        }

        return this.formSubmissionService.create(formSubmission).pipe(
          map((submissionId: RequestReturnId) => {
            this.store.dispatch(
              setSubmissionFormId({ submissionFormId: submissionId.id })
            );
            const url = `${FormSubmissionPath.BASE_PATH}/${submissionId}/${FormSubmissionPath.TASK_LIST}`;
            return navigateTo({ url: url });
          })
        );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private formSubmissionService: FormSubmissionService
  ) {}
}
