import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { RelatedActionsComponent } from '@shared/components/related-actions/related-actions.component';
import { SubmissionStatus } from '@shared/enums/status.enum';
import { UserType } from '@shared/enums/user-type.enum';
import { TextLinkItem } from '@shared/interfaces/text-link-item.interface';
import { StatusLabelPipe } from '@shared/pipes/status-label.pipe';
import { setScheme } from '@shared/store';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { RemoteData, RemoteDataModule, isSuccess } from 'ngx-remotedata';
import { Observable, map, take, takeWhile } from 'rxjs';
import { ReplySchemeForAssessor } from 'src/app/api-services/chpqa-api/generated';
import { selectUser } from 'src/app/auth/auth.selector';
import { ASSESSOR_ROUTE_PATHS } from '../../config/assessor-routes.config';
import { assessorDashboardWebCopy } from '../../config/assessor-web-copy.config';
import { AssessorDashboardService } from '../../services/assessor-dashboard.service';
import { AssessorFacade } from '../../store/assessor.facade';
import { AssessorStatusPipe } from '../../pipes/assessor-status.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './assessor-dashboard.component.html',
  styleUrls: ['./assessor-dashboard.component.scss'],
  imports: [FormsModule, CommonModule, PaginationComponent, StatusLabelPipe, RouterModule, RemoteDataModule, RelatedActionsComponent, AssessorStatusPipe],
  providers: [AssessorDashboardService],
})
export class AssessorDashboardComponent implements OnInit, OnDestroy {
  // Main Api Response Observable used to handle happy/unhappy path
  dashboardResponse$: Observable<RemoteData<ReplySchemeForAssessor[], HttpErrorResponse>> = this.assessorFacade.dashboardFacade.stateObservables.response$;

  isUserAnAssessorAdmin$ = this.store.pipe(
    select(selectUser),
    map(user => user?.userType === UserType.AssessorAdmin)
  );

  filtersVisible = false;
  searchTerm: string = '';
  selectedAssessor: string = '';
  selectedYear: string = '';
  selectedFilter: string = '';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  paginatedSchemes: ReplySchemeForAssessor[] = [];

  // Data for schemes
  schemes: ReplySchemeForAssessor[] = [];
  filteredSchemes: ReplySchemeForAssessor[] = [];

  // Dynamically generated filters for assessors, years, and statuses
  assessors: string[] = [];
  years: string[] = [];
  filters: { id: string; label: string; selected: boolean }[] = [];

  // Sorting
  sortField: string = '';
  sortOrder: string = ''; // 'asc' or 'desc'

  // UI Translations for the page
  copy = assessorDashboardWebCopy;

  // Flag that controls subscriptions
  isComponentAlive = true;

  relatedActions: TextLinkItem[] = [
    {
      text: 'Set last submission date',
      link: `/${ASSESSOR_ROUTE_PATHS.assessor}/${ASSESSOR_ROUTE_PATHS.setLastSubmissionDate.checkYourAnswers}`,
    },
  ];

  constructor(
    private assessorFacade: AssessorFacade,
    private assessorDashboardService: AssessorDashboardService,
    private keycloakService: KeycloakService,
    private store: Store,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.handleDashboardApiResponse();
    this.assessorFacade.showLoadingSpinnerForApiResponses(this.dashboardResponse$ as any, this.isComponentAlive);
    this.assessorFacade.dashboardFacade.dispatchActions.loadAssessorDashboardData();
  }

  handleDashboardApiResponse(): void {
    this.dashboardResponse$.pipe(takeWhile(() => this.isComponentAlive)).subscribe(response => {
      if (isSuccess(response)) {
        const responseValue: any[] = (response as any)?.value;
        this.mapFilters(responseValue);
        this.applyFilters();
      }
    });
  }

  mapFilters(schemes: ReplySchemeForAssessor[]): void {
    if (schemes && schemes.length) {
      this.schemes = schemes;
      this.assessors = this.assessorDashboardService.extractAssessors(this.schemes);
      this.years = this.assessorDashboardService.extractYears(this.schemes);
      this.filters = this.assessorDashboardService.extractFilters(this.schemes);
    }
  }

  toggleFilters($event: Event) {
    $event.preventDefault();
    this.filtersVisible = !this.filtersVisible;
  }

  // Search function to filter schemes based on name or reference
  onSearch() {
    this.applyFilters();
  }

  onFilterChange(filter: any) {
    filter.selected = !filter.selected;
  }

  // Apply all filters including search, checkboxes, and dropdowns
  applyFilters() {
    this.filteredSchemes = this.assessorDashboardService.applyFilters(this.schemes, this.searchTerm, this.filters, this.selectedAssessor, this.selectedYear);

    this.isUserAnAssessorAdmin$.pipe(take(1)).subscribe(isAdmin => {
      if (isAdmin) {
        const noSearchTerm = !this.searchTerm;
        const noSelectedAssessor = !this.selectedAssessor;
        const noSelectedYear = !this.selectedYear;
        const noFiltersSelected = this.filters.every(filter => !filter.selected);

        // Only sort if no filters are selected
        if (noSearchTerm && noFiltersSelected && noSelectedAssessor && noSelectedYear) {
          this.filteredSchemes = this.assessorDashboardService.sortForAssessorAdmin(this.filteredSchemes);
        }
      }
    });

    // Reset pagination when filters change
    this.currentPage = 1;
    this.updatePaginatedSchemes();
  }

  clearFilters(): void {
    this.selectedAssessor = '';
    this.selectedYear = '';
    this.filters.forEach(filter => (filter.selected = false));
    this.searchTerm = '';
    this.applyFilters();
  }

  // Sorting functionality
  sort(field: string, $event: Event) {
    $event.preventDefault();

    this.sortField === field ? (this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc') : (this.sortOrder = 'asc');

    this.sortField = field;

    this.filteredSchemes = this.assessorDashboardService.sortSchemes(this.filteredSchemes, this.sortField, this.sortOrder);
    this.updatePaginatedSchemes();
  }

  updatePaginatedSchemes() {
    this.paginatedSchemes = this.assessorDashboardService.paginateSchemes(this.filteredSchemes, this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedSchemes();
  }

  selectAssessorScheme($event: Event, scheme: ReplySchemeForAssessor): void {
    $event.preventDefault();
    this.store.dispatch(setScheme({ scheme: scheme as any }));
    this.assessorFacade.dashboardFacade.dispatchActions.setSelectedAssessorSchemeId(scheme.id);
  }

  buildRelatedActions(): TextLinkItem[] {
    let relatedActions: TextLinkItem[] = [];

    relatedActions.push({
      text: 'Set last submission date',
      link: ``,
    });

    return relatedActions;
  }

  private handleUserProfile(userProfile: KeycloakProfile): void {
    const { firstName, lastName } = userProfile;
    if (firstName || lastName) {
      const matchingAssessor = this.findMatchingAssessor(firstName, lastName);
      if (matchingAssessor) {
        this.selectedAssessor = matchingAssessor;
      }
    }
  }

  private findMatchingAssessor(firstName: string, lastName: string): string | undefined {
    return this.assessors.find(ass => ass.includes(firstName) || ass.includes(lastName));
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }
}
