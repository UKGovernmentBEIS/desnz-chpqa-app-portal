import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 20;
  @Input() maxPageLinks: number = 5;
  @Output() pageChanged = new EventEmitter<number>();

  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.totalItems || changes.itemsPerPage) {
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updatePages();
    }
  }

  updatePages() {
    const start = Math.max(this.currentPage - Math.floor(this.maxPageLinks / 2), 1);
    const end = Math.min(start + this.maxPageLinks - 1, this.totalPages);

    this.pages = Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }

  onPageClick(page: number) {
    this.currentPage = page;
    this.updatePages();
    this.pageChanged.emit(this.currentPage);
  }
}
