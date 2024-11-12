import { createAction, props } from '@ngrx/store';
import { UpdSubmtoAssessorClass } from 'src/app/api-services/chpqa-api/generated';

const submitToAssessor = createAction(
  '[SubmitToAssessor] Submit To Assessor',
  props<{ payload: UpdSubmtoAssessorClass }>()
);

const submitToAssessorSuccess = createAction(
  '[SubmitToAssessor] Submit To Assessor Success',
  props<{ response: any }>()
);

const submitToAssessorFailure = createAction(
  '[SubmitToAssessor] Submit To Assessor Failure',
  props<{ error: any }>()
);

export const SubmitToAssessorActions = {
  submitToAssessor,
  submitToAssessorSuccess,
  submitToAssessorFailure,
};
