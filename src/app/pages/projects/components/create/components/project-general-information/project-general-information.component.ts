import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MultipleFileUploadComponent } from '@shared/components/multiple-file-upload/multiple-file-upload.component';
import { AVAILABLE_PROJECT_TAGS } from '@content/projects.content';
import { MatSliderModule } from '@angular/material/slider';
import { TagService } from '@core/services/tag.service';
import { Observable, Subscription } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'create-project-general-information',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MultipleFileUploadComponent,
    MatAutocompleteModule,
    MatSliderModule,
    MatDatepickerModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './project-general-information.component.html',
  styleUrl: './project-general-information.component.scss',
})
export class ProjectGeneralInformationComponent implements OnInit {
  private tagService = inject(TagService);

  generalInformationFormSig = input.required<
    FormGroup<{
      title: FormControl<string | null>;
      description: FormControl<string | null>;
      progress: FormControl<number | null>;
      tags: FormControl<string[] | null>;
      attachments: FormControl<File[] | null>;
    }>
  >({ alias: 'generalInformationForm' });

  entityTypeSig = input.required<string | null | undefined>({
    alias: 'entityType',
  });

  tags$!: Observable<any>;
  existingFilesSig = input.required<any[] | null | undefined>({
    alias: 'existingFiles',
  });

  isFilesReseted: boolean = false;

  ngOnInit(): void {
    this.tags$ = this.tagService.getAllTags();

    console.log('existingFilesSig', this.existingFilesSig());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityTypeSig']) {
      console.log(
        'ngOnChanges in ProjectGeneralInformationComponent',
        this.entityTypeSig()?.toLowerCase()
      );
    }
    if (changes['existingFilesSig']) {
      console.log(
        'existingFilesSig in ProjectGeneralInformationComponent',
        this.existingFilesSig()
      );
    }
  }

  onResetFiles(): void {
    this.existingFilesSig;
  }

  compareTags(tagId1: string, tagId2: string): boolean {
    console.log('tagId1', tagId1);
    console.log('tagId2', tagId2);
    return tagId1 === tagId2;
  }

  // onUploadComplete(fileUrls: string[]): void {
  //   console.log('Uploaded file URLs: ', fileUrls);
  //   this.generalInformationFormSig().controls.attachments.setValue(fileUrls);
  // }
}
