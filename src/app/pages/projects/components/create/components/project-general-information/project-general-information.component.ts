import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { TagService } from '@core/services/project/models/tag.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FileMetadataDTO } from '@models/file.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectType } from '@shared/enums/categories.enum';
import { ActivatedRoute } from '@angular/router';
import { GeneralInformationForm } from '@shared/types/forms/project-form.types';
import { FileUploadListComponent } from './components/file-upload-list/file-upload-list.component';
import { FileHandlerFacadeService } from '@core/services/files/file-handler-facade.service';
import { NotificationService } from '@core/services/notification.service';

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
    MatAutocompleteModule,
    MatSliderModule,
    MatDatepickerModule,
    MatListModule,
    MatIconModule,
    FileUploadListComponent,
  ],
  templateUrl: './project-general-information.component.html',
  styleUrl: './project-general-information.component.scss',
})
export class ProjectGeneralInformationComponent implements OnInit {
  private readonly tagService = inject(TagService);
  private readonly fileHandler = inject(FileHandlerFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationService);

  generalInformationForm = input.required<FormGroup<GeneralInformationForm>>();
  entityType = input.required<ProjectType | null | undefined>();
  existingFiles = input.required<FileMetadataDTO[] | null | undefined>();

  readonly tags$ = this.tagService.getAllTags();

  ngOnInit(): void {
    this.fileHandler.initialize(this.existingFiles() || []);
    this.updateFormControl({ emitEvent: false });
  }

  onFilesSelected(files: File[]): void {
    this.fileHandler.onFilesSelected(files);
    this.updateFormControl();
  }

  compareTags(tagId1: string, tagId2: string): boolean {
    return tagId1 === tagId2;
  }

  uploadFiles(): void {
    const entityType = this.entityType();
    const entityId = this.getEntityId();

    if (!entityType || !entityId) {
      this.notificationService.showError(
        'Cannot upload files - missing project information'
      );
      return;
    }

    this.fileHandler.uploadFiles(entityType, entityId).subscribe({
      next: ({ files }) => {
        this.fileHandler.handleUploadSuccess(files);
        this.updateFormControl();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.notificationService.showError('File upload failed');
      },
    });
  }

  removeFile(index: number, isPending: boolean): void {
    this.fileHandler.removeFile(index, isPending).subscribe({
      next: () => this.updateFormControl(),
      error: (error) => {
        console.error('Error removing file:', error);
        this.notificationService.showError('Failed to remove file');
      },
    });
  }

  get uploadedFiles(): FileMetadataDTO[] {
    return this.fileHandler.uploadedFiles();
  }
  get pendingFiles(): File[] {
    return this.fileHandler.pendingFiles();
  }
  get isUploading(): boolean {
    return this.fileHandler.isUploading();
  }
  get uploadProgress(): number {
    return this.fileHandler.uploadProgress();
  }

  private updateFormControl(options?: { emitEvent: boolean }): void {
    const { uploaded, pending } = this.fileHandler.getFiles();
    this.generalInformationForm().controls.attachments.setValue(
      [...uploaded, ...pending],
      options
    );
  }

  private getEntityId(): string {
    return this.route.snapshot.queryParamMap.get('id') || '';
  }
}
