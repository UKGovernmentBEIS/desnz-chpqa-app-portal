import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import * as fromShared from '../shared/store/shared.reducer';
import * as fromAuth from '../auth/auth.reducer';

export interface AppState {
  shared: fromShared.State;
  auth: fromAuth.AuthState;
  router: fromRouter.RouterReducerState<any>;
}

export const reducers: ActionReducerMap<AppState> = {
  shared: fromShared.reducer,
  auth: fromAuth.reducer,
  router: fromRouter.routerReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [];
