import { FormControl, FormGroup } from '@angular/forms';
import { IUser } from './users.types';
import { ResponseUserDTO } from '@models/user.model';

export type BaseFormInputs = {
  allUsers: IUser[] | null;
  authors: (IUser | ResponseUserDTO | any)[] | null;
};

export interface PublicationForm {
  authors: FormControl<string[] | null>;
  publicationDate: FormControl<Date | null>;
  publicationSource: FormControl<string | null>;
  doiIsbn: FormControl<string | null>;
  startPage: FormControl<number | null>;
  endPage: FormControl<number | null>;
  journalVolume: FormControl<number | null>;
  issueNumber: FormControl<number | null>;
}

export interface PatentForm {
  primaryAuthor: FormControl<string | null>;
  coInventors: FormControl<number[] | null>;
  registrationNumber: FormControl<string | null>;
  registrationDate: FormControl<Date | null>;
  issuingAuthority: FormControl<string | null>;
}

export interface ResearchForm {
  participants: FormControl<string[] | null>;
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
