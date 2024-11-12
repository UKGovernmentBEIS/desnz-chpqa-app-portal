import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginGuard } from '@shared/guards';
import { CookiesPopUpContainerComponent } from './components/cookies-pop-up/cookies-pop-up-container.component';
import { HeaderComponent } from './components/header/header.component';
import { FeedbackBannerComponent } from './components/feedback-banner/feedback-banner.component';
import { FooterComponent } from './components/footer/footer.component';
import { BreadcrumbsComponent } from '../core/navigation/breadcrumbs/breadcrumbs.component';
import { OrganisationInfoBannerComponent } from './components/organisation-info-banner/organisation-info-banner.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CookiesPopUpContainerComponent,
    HeaderComponent,
    FooterComponent,
    FeedbackBannerComponent,
    BreadcrumbsComponent,
    OrganisationInfoBannerComponent,
    ErrorSummaryComponent,
  ],
  providers: [LoginGuard],
  exports: [
    CookiesPopUpContainerComponent,
    HeaderComponent,
    FooterComponent,
    FeedbackBannerComponent,
    BreadcrumbsComponent,
    OrganisationInfoBannerComponent,
    ErrorSummaryComponent,
  ],
})
export class SharedModule {}
