import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, TitleStrategy } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import {
  MinimalRouterStateSerializer,
  StoreRouterConnectingModule,
} from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { SharedModule } from '@shared/shared.module';
import { SharedEffects } from '@shared/store/shared.effect';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { RemoteDataModule } from 'ngx-remotedata';
import { NgxSpinnerModule } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthEffects } from './auth/auth.effect';
import { AuthInterceptor } from './auth/auth.interceptor';
import { GenericErrorInterceptor } from './core/api/generic-error.interceptor';
import * as fromShared from './shared/store';
import { reducer as sharedReducer } from './shared/store';
import * as fromApp from './store/app.reducer';
import { AssessorEffects } from './features/assessor/store/assessor.effects';
import { ReviewDecisionEffects } from './features/assessor/components/review-decision/store/review-decision.effects';
import { assessorReducer } from './features/assessor/store/assessor.reducer';
import { reviewDecisionReducer } from './features/assessor/components/review-decision/store/review-decision.reducer';
import { AppTitleStrategy } from '@shared/services/app-title-strategy.service';
import { TimeoutModalComponent } from '@shared/components/timeout-modal/timeout-modal.component';
import { DashboardEffects } from '@shared/components/dashboard/store/dashboard.effects';
import { dashboardReducer } from '@shared/components/dashboard/store/dashboard.reducer';

for (let [key, val] of Object.entries(environment)) {
  console.log(key, val);
}

function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'check-sso',
        enableLogging: true,
        pkceMethod: 'S256',
        flow: 'standard',
      },
      enableBearerInterceptor: false,
    });
}

@NgModule({
  declarations: [AppComponent, TimeoutModalComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    KeycloakAngularModule,
    SharedModule,
    EffectsModule.forRoot([SharedEffects, AuthEffects, DashboardEffects, AssessorEffects, ReviewDecisionEffects]),
    StoreModule.forFeature(fromShared.sharedFeatureKey, sharedReducer),
    StoreModule.forFeature('dashboardReducer', dashboardReducer),
    StoreModule.forFeature('assessor', assessorReducer),
    StoreModule.forFeature('reviewDecision', reviewDecisionReducer),
    StoreModule.forRoot(fromApp.reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 50,
      logOnly: false,
      connectInZone: true,
    }),
    StoreRouterConnectingModule.forRoot({
      serializer: MinimalRouterStateSerializer,
    }),
    RemoteDataModule,
    NgxSpinnerModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GenericErrorInterceptor,
      multi: true,
    },
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
