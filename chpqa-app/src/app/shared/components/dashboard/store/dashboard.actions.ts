import { createAction, props } from '@ngrx/store';
import { DashboardScheme } from '../models/dashboard-scheme.model';
import { UserType } from '@shared/enums/user-type.enum';

const loadData = createAction(
  '[DashboardComponent] Load Dashboard Data',
  props<{ userType: UserType }>()
);
const loadDataSuccess = createAction(
  '[DashboardComponent] Load Dashboard Data Success',
  props<{ payload: DashboardScheme[] }>()
);
const loadDataFailure = createAction(
  '[DashboardComponent] Load Dashboard Data Failure',
  props<{ error: any }>() // Define error
);

export const DashboardActions = {
  loadData,
  loadDataSuccess,
  loadDataFailure,
};
