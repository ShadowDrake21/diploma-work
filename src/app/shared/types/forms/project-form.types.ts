import { FormControl, FormGroup } from '@angular/forms';

import { IUser, ResponseUserDTO } from '@models/user.model';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectType } from '@shared/enums/categories.enum';

export type BaseFormInputs = {
  allUsers: IUser[] | null;
  authors: (IUser | ResponseUserDTO | any)[] | null;
};

export interface TypeForm {
  type: FormControl<ProjectType | null>;
}

export interface GeneralInformationForm {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  progress: FormControl<number | null>;
  tags: FormControl<string[] | null>;
  attachments: FormControl<(File | FileMetadataDTO)[] | null>;
}

export interface PublicationForm {
  authors: FormControl<number[] | null>;
  publicationDate: FormControl<Date | null>;
  publicationSource: FormControl<string | null>;
  doiIsbn: FormControl<string | null>;
  startPage: FormControl<number | null>;
  endPage: FormControl<number | null>;
  journalVolume: FormControl<number | null>;
  issueNumber: FormControl<number | null>;
}

export interface PatentForm {
  primaryAuthor: FormControl<number | null>;
  coInventors: FormControl<number[] | null>;
  registrationNumber: FormControl<string | null>;
  registrationDate: FormControl<Date | null>;
  issuingAuthority: FormControl<string | null>;
}

export interface ResearchForm {
  participantIds: FormControl<number[] | null>;
  budget: FormControl<number | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  status: FormControl<string | null>;
  fundingSource: FormControl<string | null>;
}

export type PublicationFormGroup = FormGroup<PublicationForm>;
export type PatentFormGroup = FormGroup<PatentForm>;
export type ResearchFormGroup = FormGroup<ResearchForm>;

export type ProjectFormGroup =
  | PublicationFormGroup
  | PatentFormGroup
  | ResearchFormGroup;
