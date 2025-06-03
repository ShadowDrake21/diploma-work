import { inject, Injectable, signal } from '@angular/core';
import { FileHandlerService } from './file-handler.service';
import { FileMetadataDTO } from '@models/file.model';
import { Observable, tap, finalize, map, of } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';

@Injectable({
  providedIn: 'root',
})
export class FileHandlerFacadeService {
  private readonly coreFileHandler = inject(FileHandlerService);

  readonly uploadProgress = signal(0);
  readonly isUploading = signal(false);
  readonly uploadedFiles = signal<FileMetadataDTO[]>([]);
  readonly pendingFiles = signal<File[]>([]);

  initialize(existingFiles: FileMetadataDTO[] = []): void {
    this.uploadedFiles.set(existingFiles);
    this.pendingFiles.set([]);
    this.uploadProgress.set(0);
    this.isUploading.set(false);
  }

  onFilesSelected(files: File[]): void {
    const uniqueNewFiles = this.filterDuplicateFiles(files);
    if (uniqueNewFiles.length > 0) {
      this.pendingFiles.update((current) => [...current, ...uniqueNewFiles]);
    }
  }

  uploadFiles(
    entityType: ProjectType,
    entityId: string
  ): Observable<{ files: FileMetadataDTO[]; progress: number }> {
    const filesToUpload = this.pendingFiles();
    if (!filesToUpload.length || !entityType || !entityId) {
      throw new Error('Cannot upload files - missing required parameters');
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    return this.coreFileHandler
      .uploadFiles(entityType, entityId, filesToUpload)
      .pipe(
        tap(({ progress }) => this.uploadProgress.set(progress)),
        finalize(() => {
          this.isUploading.set(false);
        })
      );
  }

  handleUploadSuccess(files: FileMetadataDTO[]): void {
    if (files?.length) {
      this.pendingFiles.update((current) =>
        current.filter(
          (pendingFile) => !files.some((f) => f.fileName === pendingFile.name)
        )
      );
      this.uploadedFiles.update((current) => [...current, ...files]);
    }
  }

  removeFile(index: number, isPending: boolean): Observable<void> {
    if (isPending) {
      this.pendingFiles.update((files) => files.filter((_, i) => i !== index));
      return new Observable((subscriber) => subscriber.next());
    } else {
      const file = this.uploadedFiles()[index];
      return this.coreFileHandler.deleteFile(file).pipe(
        tap(() => {
          this.uploadedFiles.update((files) =>
            files.filter((_, i) => i !== index)
          );
        }),
        map(() => undefined)
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
}
