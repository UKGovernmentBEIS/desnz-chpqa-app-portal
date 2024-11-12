import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { DashboardWebCopy } from '../../models/dashboard-webcopy.model';
import { RelatedActionsComponent } from '@shared/components/related-actions/related-actions.component';
import { DashboardScheme } from '../../models/dashboard-scheme.model';
import { DashboardTableService } from '../../services/dashboard-table.service';
import { StatusToColorPipe } from '@shared/pipes/status-to-color.pipe';
import { StatusLabelPipe } from '@shared/pipes/status-label.pipe';
import { DashboardFilter } from '../../models/dashboard-filter.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    RelatedActionsComponent,
    StatusLabelPipe,
    StatusToColorPipe,
  ],
  providers: [DashboardTableService],
})
export class DashboardComponent implements OnInit {
  // UI Translations for the page
  @Input({ required: true }) webCopy!: DashboardWebCopy;
  @Input({ required: true }) isUserAnAssessor: boolean;
  @Input({ required: true })
  set schemes(value: DashboardScheme[]) {
    this._schemes = value;
    this.filters = this.dashboardTableService.extractFilters(this.schemes);
    this.years = this.dashboardTableService.extractYears(this.schemes);
  }
  get schemes() {
    return this._schemes;
  }
  @Input() usersToFilterBy: string[] = [];

  @Output() schemeSelected: EventEmitter<{event: Event, scheme: DashboardScheme }> =
    new EventEmitter<{ event: Event, scheme: DashboardScheme }>();
  
  applyFilter = false;
  filtersVisible = false;
  searchTerm: string = '';
  selectedUser: string = '';
  selectedYear: string = '';
  selectedFilters: string = '';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  paginatedSchemes: DashboardScheme[] = [];

  // Filters
  filters: DashboardFilter[] = [];
  years: string[] = [];

  // Data for schemes
  filteredSchemes: DashboardScheme[] = [];

  // Sorting
  sortField: string = '';
  sortOrder: string = ''; // 'asc' or 'desc'

  private _schemes: DashboardScheme[] = [];

  constructor(
    private dashboardTableService: DashboardTableService
  ) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  toggleFilters($event: Event) {
    $event.preventDefault();
    this.filtersVisible = !this.filtersVisible;
  }

  // Search function to filter schemes based on name or reference
  onSearch() {
    this.applyFilters();
    this.applyFilter = true;
  }
  
  onApplyFilters() {
    this.applyFilters();
    this.applyFilter = true;
  }

  onFilterChange(filter: DashboardFilter) {
    filter.selected = !filter.selected;
    this.updateFilterSummary();
  }
  
  private updateFilterSummary() {
    const selectedLabels = this.filters
      .filter(filter => filter.selected)
      .map(filter => filter.label);
  
    this.selectedFilters = selectedLabels.length
      ? selectedLabels.join(', ')
      : '';
  }

  // Apply all filters including search, checkboxes, and dropdowns
  applyFilters() {
    this.filteredSchemes = this.dashboardTableService.applyFilters(
      this.isUserAnAssessor,
      this.schemes,
      this.searchTerm,
      this.filters,
      this.selectedUser,
      this.selectedYear
    );

    // Reset pagination when filters change
    this.currentPage = 1;
    this.updatePaginatedSchemes();
  }

  clearFilters(): void {
    this.applyFilter = false;
    this.selectedFilters = '';
    this.selectedUser = '';
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

    this.filteredSchemes = this.dashboardTableService.sortSchemes(this.filteredSchemes, this.sortField, this.sortOrder);
    this.updatePaginatedSchemes();
  }

  updatePaginatedSchemes() {
    this.paginatedSchemes = this.dashboardTableService.paginateSchemes(this.filteredSchemes, this.currentPage, this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedSchemes();
  }

  selectScheme($event: Event, scheme: DashboardScheme): void {
    this.schemeSelected.emit({ event: $event, scheme });
  }
  
}
