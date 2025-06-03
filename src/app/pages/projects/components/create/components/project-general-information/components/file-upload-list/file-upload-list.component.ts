import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
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
  private notificationService = inject(NotificationService);

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
    try {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      const files = Array.from(input.files);
      if (files.some((file) => file.size > 20 * 1024 * 1024)) {
        this.notificationService.showError(
          'Some files exceed the 20MB size limit'
        );
        return;
      }
      this.filesSelected.emit(files);
      input.value = '';
    } catch (error) {
      console.error('Error handling file selection:', error);
      this.notificationService.showError('Error selecting files');
    }
  }

  handleRemoveFile(index: number, isPending: boolean): void {
    try {
      this.removeFile.emit({ index, isPending });
    } catch (error) {
      console.error('Error removing file:', error);
      this.notificationService.showError('Error removing file');
    }
  }
}
