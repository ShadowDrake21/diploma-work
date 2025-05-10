import { inject, Injectable } from '@angular/core';
import { AttachmentsService } from './attachments.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { FileMetadataDTO } from '@models/file.model';
import { format } from 'date-fns';
import { ApiResponse } from '@models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class FileHandlerService {
  private attachmentsService = inject(AttachmentsService);

  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<{ progress: number; files?: FileMetadataDTO[] }> {
    return this.attachmentsService
      .uploadFiles(entityType, entityId, files)
      .pipe(
        map((response) => {
          if (files.length === 1) {
            return {
              progress: 100,
              files:
                response.data && response.data[0]
                  ? [
                      this.createFileMetadata(
                        response.data[0],
                        entityType,
                        entityId,
                        files[0]
                      ),
                    ]
                  : [],
            };
          }
          return {
            progress: 100,
            files: response.data
              ? (response.data
                  .map((url, i) =>
                    url
                      ? this.createFileMetadata(
                          url,
                          entityType,
                          entityId,
                          files[i]
                        )
                      : null
                  )
                  .filter((file) => file !== null) as FileMetadataDTO[])
              : [],
          };
        }),
        catchError((error) => {
          console.error('Upload error:', error);
          return of({ progress: 100, files: [] });
        })
      );
  }

  deleteFile(file: FileMetadataDTO): Observable<ApiResponse<string>> {
    return this.attachmentsService.deleteFile(
      file.entityType.toString().toLowerCase(),
      file.entityId,
      file.fileName
    );
  }

  private createFileMetadata(
    url: string,
    entityType: ProjectType,
    entityId: string,
    file: File
  ): FileMetadataDTO {
    return {
      fileUrl: url,
      fileName: file.name,
      entityType,
      entityId,
      uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      id: '',
      fileSize: file.size,
      checksum: '',
    };
  }
}
