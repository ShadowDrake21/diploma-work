import { inject, Injectable, signal } from '@angular/core';
import { FileHandlerService } from './file-handler.service';
import { FileMetadataDTO } from '@models/file.model';
import {
  Observable,
  tap,
  finalize,
  map,
  of,
  throwError,
  catchError,
} from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root',
})
export class FileHandlerFacadeService {
  private readonly coreFileHandler = inject(FileHandlerService);
  private readonly notificationService = inject(NotificationService);

  readonly uploadProgress = signal(0);
  readonly isUploading = signal(false);
  readonly uploadedFiles = signal<FileMetadataDTO[]>([]);
  readonly pendingFiles = signal<File[]>([]);
  readonly errorState = signal<string | null>(null);

  initialize(existingFiles: FileMetadataDTO[] = []): void {
    this.uploadedFiles.set(existingFiles);
    this.pendingFiles.set([]);
    this.uploadProgress.set(0);
    this.isUploading.set(false);
    this.errorState.set(null);
  }

  onFilesSelected(files: File[]): void {
    try {
      const uniqueNewFiles = this.filterDuplicateFiles(files);
      if (uniqueNewFiles.length > 0) {
        this.pendingFiles.update((current) => [...current, ...uniqueNewFiles]);
      }
    } catch (error) {
      this.handleError('Не вдалося обробити вибрані файли', error as Error);
    }
  }

  uploadFiles(
    entityType: ProjectType,
    entityId: string
  ): Observable<{ files: FileMetadataDTO[]; progress: number }> {
    this.errorState.set(null);
    const filesToUpload = this.pendingFiles();

    if (!filesToUpload.length) {
      this.notificationService.showWarning(
        'Не вибрано файлів для завантаження'
      );
      return of({ files: [], progress: 0 });
    }

    if (!entityType || !entityId) {
      const error = new Error(
        'Не вдається завантажити файли – відсутні обов’язкові параметри'
      );
      this.handleError('Недійсні параметри завантаження', error);
      return throwError(() => error);
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    return this.coreFileHandler
      .uploadFiles(entityType, entityId, filesToUpload)
      .pipe(
        tap({
          next: ({ progress }) => this.uploadProgress.set(progress),
          error: (error) =>
            this.handleError('Не вдалося завантажити файл', error),
        }),
        catchError((error) => {
          return throwError(() => error);
        }),
        finalize(() => {
          this.isUploading.set(false);
        })
      );
  }

  handleUploadSuccess(files: FileMetadataDTO[]): void {
    try {
      if (files?.length) {
        this.pendingFiles.update((current) =>
          current.filter(
            (pendingFile) => !files.some((f) => f.fileName === pendingFile.name)
          )
        );
        this.uploadedFiles.update((current) => [...current, ...files]);
        this.notificationService.showSuccess(
          `${files.length} файл(и) успішно завантажено`
        );
      }
    } catch (error) {
      this.handleError('Не вдалося обробити завантажені файли', error as Error);
    }
  }

  removeFile(index: number, isPending: boolean): Observable<void> {
    this.errorState.set(null);

    if (isPending) {
      try {
        this.pendingFiles.update((files) =>
          files.filter((_, i) => i !== index)
        );
        return of(undefined);
      } catch (error) {
        this.handleError(
          'Не вдалося видалити файл, що очікує на розгляд',
          error as Error
        );
        return throwError(() => error);
      }
    } else {
      const file = this.uploadedFiles()[index];

      if (!file) {
        const error = new Error('Файл не знайдено');
        this.handleError('Файл не знайдено', error);
        return throwError(() => error);
      }

      return this.coreFileHandler.deleteFile(file).pipe(
        tap({
          next: () => {
            this.uploadedFiles.update((files) =>
              files.filter((_, i) => i !== index)
            );
            this.notificationService.showSuccess('Файл успішно видалено');
          },
          error: (error) => this.handleError('Не вдалося видалити файл', error),
        }),
        map(() => undefined),
        catchError((error) => throwError(() => error))
      );
    }
  }

  getFiles(): { uploaded: FileMetadataDTO[]; pending: File[] } {
    return {
      uploaded: this.uploadedFiles(),
      pending: this.pendingFiles(),
    };
  }

  private filterDuplicateFiles(newFiles: File[]): File[] {
    const currentFiles = [...this.uploadedFiles(), ...this.pendingFiles()];
    const existingFileKeys = new Set(
      currentFiles.map((file) => this.getFileKey(file))
    );
    return newFiles.filter(
      (file) => !existingFileKeys.has(this.getFileKey(file))
    );
  }

  private getFileKey(file: File | FileMetadataDTO): string {
    return file instanceof File ? file.name : file.fileName;
  }

  private handleError(message: string, error: Error): void {
    console.error(`${message}:`, error);
    this.errorState.set(message);
    this.notificationService.showError(message);
  }
}
