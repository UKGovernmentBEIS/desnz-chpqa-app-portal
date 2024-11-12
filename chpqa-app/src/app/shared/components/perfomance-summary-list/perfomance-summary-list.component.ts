import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PerformanceSummary } from '@shared/models/summary-lists';
import { DecimalFormatterPipe } from "../../pipes/decimal-formatter.pipe";
import { SchemeRegistration } from 'src/app/tasks/scheme-registration/models/scheme-registration.model';
import { SubmissionStatus } from '@shared/enums/status.enum';

@Component({
  selector: 'app-perfomance-summary-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalFormatterPipe],
  templateUrl: './perfomance-summary-list.component.html',
  styleUrl: './perfomance-summary-list.component.scss',
})
export class PerfomanceSummaryListComponent {
  @Input() typeLabel = '';
  @Input() categoryLabel = '';
  @Input() subTask = '';
  @Input() measurementUnit = '';
  @Input() showTFI = false;
  @Input() details: PerformanceSummary[] = [];
  @Input() selectedScheme: SchemeRegistration;
  @Output() change = new EventEmitter<{
    value: PerformanceSummary;
    index: number;
  }>();
  SubmissionStatusEnum = SubmissionStatus;

  onLinkClick(event: Event, item: any, index: number): void {
    event.preventDefault();
    this.change.emit({ value: item, index: index });
  }
}
