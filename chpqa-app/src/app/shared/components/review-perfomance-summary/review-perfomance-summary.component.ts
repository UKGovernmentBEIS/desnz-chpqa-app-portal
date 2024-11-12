import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Months } from '@shared/enums/months.enum';
import { PerformanceSummary } from '@shared/models/summary-lists';
import { CapitalizeFirstLetterPipe } from '@shared/pipes/capitalize-first-letter.pipe';
import { DecimalFormatterPipe } from '@shared/pipes/decimal-formatter.pipe';

@Component({
  selector: 'app-review-perfomance-summary',
  standalone: true,
  templateUrl: './review-perfomance-summary.component.html',
  styleUrl: './review-perfomance-summary.component.scss',
  imports: [CommonModule, CapitalizeFirstLetterPipe, DecimalFormatterPipe],
})
export class ReviewPerfomanceSummaryComponent implements OnChanges {
  @Input() subtask = '';
  @Input() typeLabel = '';
  @Input() categoryLabel = '';
  @Input() measurementUnit = '';
  @Input() details: PerformanceSummary;
  @Input() showTFI = false;
  @Input() monthsData: { [key in Months]?: number } = null;
  @Output() return = new EventEmitter();

  monthsArray: string[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['monthsData']) {
      this.monthsArray = this.monthsData ? Object.keys(this.monthsData) : null;
    }
  }

  onReturn() {
    this.return.emit();
  }
}
