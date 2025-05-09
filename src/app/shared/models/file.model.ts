import { ProjectType } from '@shared/enums/categories.enum';

export interface FileMetadataDTO {
  id: string;
  fileName: string;
  fileUrl: string;
  entityType: ProjectType;
  entityId: string;
  uploadedAt: string;
  fileSize?: number;
  checksum?: string;
}
