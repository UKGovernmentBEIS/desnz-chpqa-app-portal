import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SubmissionStatus } from '@shared/enums/status.enum';
import { MetricsSummaryList } from '@shared/models/summary-lists';

@Component({
  selector: 'app-metrics-summary-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './metrics-summary-list.component.html',
  styleUrl: './metrics-summary-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsSummaryListComponent implements OnInit {
  @Input() title: string;
  @Input() details: MetricsSummaryList[];
  @Input({ required: true }) isDetailsVisible!: boolean;
  @Input() metric: string;
  @Input() id: string;
  @Input() latestSubmissionStatus: SubmissionStatus;
  @Output() delete = new EventEmitter();
  @Output() change = new EventEmitter();
  @Output() downloadFile = new EventEmitter<{fileId: string, fileName: string}>();

  arrowPointsDown: boolean;
  SubmissionStatusEnum = SubmissionStatus;

  constructor(private router: Router) {}

  ngOnInit() {
    this.arrowPointsDown = this.isDetailsVisible;
  }

  onDelete() {
    this.delete.emit();
  }

  onChange(event: Event, changeLocation: string) {
    event.preventDefault();
    this.change.emit();
    this.router.navigate([changeLocation]);
  }

  toggleDetails() {
    this.isDetailsVisible = !this.isDetailsVisible;
  }

  onDownloadFile(fileId: string | undefined, fileName: string): void {
    if (fileId) {
      this.downloadFile.emit({fileId: fileId, fileName: fileName});
    }
  }
}
