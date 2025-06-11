import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
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
import { ProjectType } from '@shared/enums/categories.enum';
import { ActivatedRoute } from '@angular/router';
import { GeneralInformationForm } from '@shared/types/forms/project-form.types';
import { FileUploadListComponent } from './components/file-upload-list/file-upload-list.component';
import { FileHandlerFacadeService } from '@core/services/files/file-handler-facade.service';
import { NotificationService } from '@core/services/notification.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GENERAL_INFORMATION_FORM_ERRORS } from '../errors/general-information.errors';

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
    MatProgressBarModule,
  ],
  templateUrl: './project-general-information.component.html',
  styleUrl: './project-general-information.component.scss',
})
export class ProjectGeneralInformationComponent {
  private readonly tagService = inject(TagService);
  private readonly fileHandler = inject(FileHandlerFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly notificationService = inject(NotificationService);
  private readonly attachmentsService = inject(AttachmentsService);

  generalInformationForm = input.required<FormGroup<GeneralInformationForm>>();
  entityType = input.required<ProjectType | null | undefined>();
  existingFiles = signal<FileMetadataDTO[] | null>(null);
  private entityId = computed(() => this.getEntityId());
  isEditing = computed(() => !!this.entityId());

  isFilesLoading = signal<boolean>(false);

  formErrors = GENERAL_INFORMATION_FORM_ERRORS;

  readonly tags$ = this.tagService.getAllTags();

  constructor() {
    effect(() => {
      if (this.entityType() && this.entityId()) {
        this.fetchExistingFiles();
      }
    });
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

  fetchExistingFiles() {
    this.isFilesLoading.set(true);
    const entityType = this.entityType();
    const projectId = this.getEntityId();

    if (projectId && entityType) {
      this.attachmentsService
        .getFilesByEntity(entityType, projectId)
        .subscribe({
          next: (files) => {
            console.log('Fetched existing files:', files);
            this.existingFiles.set(files);

            console.log('Initializing file handler with:', files);
            this.fileHandler.initialize(files);
            this.updateFormControl({ emitEvent: false });

            this.isFilesLoading.set(false);
          },
          error: (error) => {
            console.error('Error fetching files:', error);
            this.notificationService.showError('Failed to load files');
            this.fileHandler.initialize([]);
            this.isFilesLoading.set(false);
          },
        });
    } else {
      this.fileHandler.initialize([]);
      this.isFilesLoading.set(false);
    }
  }
}
