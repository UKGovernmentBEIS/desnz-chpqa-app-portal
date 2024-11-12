import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { isSuccess, RemoteData, RemoteDataModule } from 'ngx-remotedata';
import { Observable, takeWhile } from 'rxjs';
import { ReplyScheme } from 'src/app/api-services/chpqa-api/generated';
import { responsiblePersonDashboardWebCopy } from '../../config/responsible-person-web-copy.config';
import { ResponsiblePersonDashboardService } from '../../services/responsible-person-dashboard.service';
import { DashboardComponent } from '@shared/components/dashboard/pages/dashboard/dashboard.component';
import { Store } from '@ngrx/store';
import { resetToInitialState, setScheme } from '@shared/store';
import { DashboardFacade } from '@shared/components/dashboard/store/dashboard.facade';
import { UserType } from '@shared/enums/user-type.enum';

@Component({
  selector: 'app-responsible-person-dashboard',
  standalone: true,
  templateUrl: './responsible-person-dashboard.component.html',
  imports: [
    CommonModule,
    DashboardComponent,
    RemoteDataModule
  ],
  providers: [ResponsiblePersonDashboardService],
})
export class ResponsiblePersonDashboardComponent implements OnInit, OnDestroy {
  // Main Api Response Observable used to handle happy/unhappy path
  dashboardResponse$: Observable<RemoteData<ReplyScheme[], HttpErrorResponse>> = this.dashboardFacade.dashboardFacade.stateObservables.response$;

  // Data for schemes
  schemes: ReplyScheme[] = [];

  // Dynamically generated filters for responsible persons, years, and statuses
  responsiblePersons: string[] = [];
  selectedResponsiblePerson: string = '';

  // UI Translations for the page
  webCopy = responsiblePersonDashboardWebCopy;

  // Flag that controls subscriptions
  isComponentAlive = true;

  constructor(
    private dashboardFacade: DashboardFacade,
    private dashboardService: ResponsiblePersonDashboardService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.handleDashboardApiResponse();
    this.dashboardFacade.showLoadingSpinnerForApiResponses(this.dashboardResponse$ as any, this.isComponentAlive);
    this.dashboardFacade.dashboardFacade.dispatchActions.loadDashboardData(UserType.ResponsiblePerson);
  }

  handleDashboardApiResponse(): void {
    this.dashboardResponse$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(response => {
      if (isSuccess(response)) {
        const responseValue = (response as any)?.value;
        this.mapFilters(responseValue);
      }
    });
  }

  mapFilters(schemes: ReplyScheme[]): void {
    if (schemes && schemes.length) {
      this.schemes = schemes;
      this.responsiblePersons = this.dashboardService.extractResponsiblePersons(this.schemes);
    }
  }

  selectScheme($event: { event: Event, scheme: ReplyScheme }): void {
    $event.event.preventDefault();
    this.store.dispatch(resetToInitialState());
    this.store.dispatch(setScheme({ scheme: $event.scheme as any }));
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
