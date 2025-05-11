import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO } from '@models/project.model';

export type TypedProjectFormValues = {
  publication?: any;
  patent?: any;
  research?: any;
};

export type ProjectWithAttachments = {
  project: ProjectDTO;
  attachments: FileMetadataDTO[];
};
