import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubmissionFormStatus } from '@shared/enums/form-submission.enum';
import { selectSelectedScheme, selectSubmissionFormId } from '@shared/store';
import { combineLatest, first, map, Observable, switchMap } from 'rxjs';
import { ChqpaApiServiceWrapper } from 'src/app/api-services/chpqa-api/custom/chqpa-api-service-wrapper';
import { UpdSubmtoAssessorClass } from 'src/app/api-services/chpqa-api/generated';
import { selectSubmissionGroupId } from 'src/app/tasks/form-submission/store/form-submission.selectors';

@Injectable({
  providedIn: 'root'
})
export class SubmitToAssessorService {

  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private chqpaApiServiceWrapper: ChqpaApiServiceWrapper,
    private route: ActivatedRoute
  ) {}

  createSubmitForm(): FormGroup {
    return this.fb.group({
      statements: [null, [Validators.required]],
    });
  }

  createPayloadToSubmit(): Observable<UpdSubmtoAssessorClass> {
    return combineLatest([this.store.select(selectSubmissionFormId), this.store.select(selectSubmissionGroupId), this.store.select(selectSelectedScheme)]).pipe(
      first(),
      map(([idSubmission, idGroup, scheme]) => ({
        idSubmission,
        idGroup,
        status: SubmissionFormStatus.Completed,
        userid: scheme.responsiblePerson.id,
        schemename: scheme.name,
      }))
    );
  }
}
