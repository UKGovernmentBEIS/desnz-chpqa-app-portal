import { createAction, props } from "@ngrx/store";
import { ReplySubmissionHistory } from "src/app/api-services/chpqa-api/generated";

const loadSchemeHistoryData = createAction('[SchemeHistoryComponent] Load Scheme History Data');
const loadSchemeHistoryDataSuccess = createAction(
  '[SchemeHistoryComponent] Load Scheme History Data Success',
  props<{ payload: ReplySubmissionHistory[] }>() // Define payload
);
const loadSchemeHistoryDataFailure = createAction(
  '[SchemeHistoryComponent] Load Scheme History Data Failure',
  props<{ error: any }>() // Define error
);
export const SchemeHistoryActions = {
  loadSchemeHistoryData,
  loadSchemeHistoryDataSuccess,
  loadSchemeHistoryDataFailure,
};
