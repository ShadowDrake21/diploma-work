import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEditModalComponent } from './project-edit-modal.component';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AttachmentsService } from '@core/services/attachments.service';
import { FileHandlerFacadeService } from '@core/services/files/file-handler-facade.service';
import { NotificationService } from '@core/services/notification.service';
import { TagService } from '@core/services/project/models/tag.service';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO } from '@models/project.model';
import { Tag } from '@models/tag.model';
import {
  MockedComponentFixture,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';
import { of } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProjectEditModalComponent', () => {
  let component: ProjectEditModalComponent;
  let fixture: MockedComponentFixture<ProjectEditModalComponent>;
  const mockProject: ProjectDTO = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description',
    progress: 50,
    type: ProjectType.PUBLICATION,
    tagIds: ['1', '2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
  };
  const mockTags: Tag[] = [
    { id: '1', name: 'Tag 1' },
    { id: '2', name: 'Tag 2' },
  ];
  const mockFiles: FileMetadataDTO[] = [
    {
      id: '1',
      fileName: 'file1.pdf',
      fileSize: 1000,
      fileUrl: 'url1',
      entityId: '1',
      entityType: ProjectType.PUBLICATION,
      uploadedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    return MockBuilder(ProjectEditModalComponent)
      .mock(ProjectFormService)
      .provide({
        provide: ProjectFormService,
        useValue: {
          createGeneralInfoForm: () =>
            new FormBuilder().group({
              title: [''],
              description: [''],
              progress: [0],
              tags: [[]],
            }),
          patchGeneralInformationForm: jest.fn(),
        },
      })
      .mock(TagService)
      .provide({
        provide: TagService,
        useValue: {
          getAllTags: () => of(mockTags),
        },
      })
      .mock(AttachmentsService)
      .provide({
        provide: AttachmentsService,
        useValue: {
          getFilesByEntity: () => of(mockFiles),
        },
      })
      .mock(NotificationService)
      .mock(FileHandlerFacadeService)
      .provide({
        provide: FileHandlerFacadeService,
        useValue: {
          initialize: jest.fn(),
          uploadedFiles: () => mockFiles,
          pendingFiles: () => [],
          isUploading: () => false,
          uploadProgress: () => 0,
          onFilesSelected: jest.fn(),
          uploadFiles: () => of({ files: mockFiles }),
          removeFile: () => of({}),
          handleUploadSuccess: jest.fn(),
        },
      })
      .mock(MatDialogRef);
  });

  beforeEach(() => {
    fixture = MockRender(ProjectEditModalComponent, undefined, {
      providers: [
        { provide: 'MAT_DIALOG_DATA', useValue: { project: mockProject } },
      ],
    });
    component = fixture.point.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with project data', () => {
    const formService = ngMocks.findInstance(ProjectFormService);
    expect(formService.patchGeneralInformationForm).toHaveBeenCalledWith(
      component.projectForm,
      mockProject
    );
  });

  it('should load tags on init', () => {
    expect(component.allTags()).toEqual(mockTags);
  });

  it('should load attachments on init', () => {
    const fileHandler = ngMocks.findInstance(FileHandlerFacadeService);
    expect(fileHandler.initialize).toHaveBeenCalledWith(mockFiles);
  });

  it('should handle file selection', () => {
    const testFiles = [new File([], 'test.txt')];
    const fileHandler = ngMocks.findInstance(FileHandlerFacadeService);

    component.onFilesSelected(testFiles);
    expect(fileHandler.onFilesSelected).toHaveBeenCalledWith(testFiles);
  });

  it('should upload files', () => {
    const fileHandler = ngMocks.findInstance(FileHandlerFacadeService);
    component.uploadFiles();
    expect(fileHandler.uploadFiles).toHaveBeenCalledWith(
      mockProject.type,
      mockProject.id
    );
  });

  it('should remove file', () => {
    const fileHandler = ngMocks.findInstance(FileHandlerFacadeService);
    component.removeFile(0, false);
    expect(fileHandler.removeFile).toHaveBeenCalledWith(0, false);
  });

  it('should submit form when valid', () => {
    const notificationService = ngMocks.findInstance(NotificationService);
    component.projectForm.patchValue({
      title: 'Updated Title',
      description: 'Updated Description',
      progress: 75,
      tags: ['1'],
    });

    component.onSubmit();

    expect(notificationService.showSuccess).toHaveBeenCalledWith(
      'Проєкт успішно оновлено'
    );
  });

  it('should show error when form is invalid', () => {
    const notificationService = ngMocks.findInstance(NotificationService);
    component.projectForm.patchValue({
      title: '',
      description: '',
    });

    component.onSubmit();

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Будь ласка, заповніть усі обовʼязкові поля'
    );
  });

  it('should close dialog on cancel', () => {
    const dialogRef = ngMocks.findInstance(MatDialogRef);
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should compare tags correctly', () => {
    expect(component.compareTags('1', '1')).toBeTrue();
    expect(component.compareTags('1', '2')).toBeFalse();
  });
});
