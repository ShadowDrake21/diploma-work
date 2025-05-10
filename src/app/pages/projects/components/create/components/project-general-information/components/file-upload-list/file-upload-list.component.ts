import { DatePipe } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileMetadataDTO } from '@models/file.model';
import { FileSizePipe } from '@pipes/file-size.pipe';

@Component({
  selector: 'general-information-file-upload-list',
  imports: [
    MatIcon,
    MatProgressBarModule,
    MatListModule,
    FileSizePipe,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  templateUrl: './file-upload-list.component.html',
  styleUrl: './file-upload-list.component.scss',
})
export class FileUploadListComponent {
  uploadedFiles = input.required<FileMetadataDTO[]>();
  pendingFiles = input.required<File[]>();
  isUploading = input(false);
  uploadProgress = input(0);

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadRequested = new EventEmitter<void>();
  @Output() removeFile = new EventEmitter<{
    index: number;
    isPending: boolean;
  }>();

  handleFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.filesSelected.emit(Array.from(input.files));
    input.value = '';
  }

  handleRemoveFile(index: number, isPending: boolean): void {
    this.removeFile.emit({ index, isPending });
  }
}
