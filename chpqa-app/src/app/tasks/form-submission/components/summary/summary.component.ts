import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SummaryDetails } from '../../model/summary-details.model';

@Component({
  selector: 'app-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  imports: [CommonModule, RouterModule],
})
export class SummaryComponent {
  // TODO - this component might not be used anymore
  @Input() summaryDetails: SummaryDetails;
  @Input() backButtonUrl: string;
  @Output() submitClicked = new EventEmitter<boolean>();

  constructor() {}

  submitClick(): void {
    this.submitClicked.emit(true);
  }
}
