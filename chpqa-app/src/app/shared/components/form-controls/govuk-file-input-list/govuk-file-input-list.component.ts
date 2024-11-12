import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FileWithId } from '@shared/models/file-with-id.model';

@Component({
  selector: 'app-govuk-file-input-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './govuk-file-input-list.component.html',
  styleUrl: './govuk-file-input-list.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class GovukFileInputListComponent {
  @Input() filesWithId: FileWithId[] = [];
  @Output() fileDeleted = new EventEmitter<{ id: string; fileIndex: number }>();

  deleteFile(id: string, fileIndex: number) {
    this.fileDeleted.emit({ id, fileIndex });
  }
}
