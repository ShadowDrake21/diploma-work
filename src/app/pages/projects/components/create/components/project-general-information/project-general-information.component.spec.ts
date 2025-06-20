import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGeneralInformationComponent } from './project-general-information.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { AttachmentsService } from '@core/services/attachments.service';
import { FileHandlerFacadeService } from '@core/services/files/file-handler-facade.service';
import { NotificationService } from '@core/services/notification.service';
import { TagService } from '@core/services/project/models/tag.service';
import { FileMetadataDTO } from '@models/file.model';
import { of } from 'rxjs';
import { FileUploadListComponent } from './components/file-upload-list/file-upload-list.component';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProjectGeneralInformationComponent', () => {
  let component: ProjectGeneralInformationComponent;
  let fixture: ComponentFixture<ProjectGeneralInformationComponent>;
  let mockTagService: jasmine.SpyObj<TagService>;
  let mockFileHandler: jasmine.SpyObj<FileHandlerFacadeService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAttachmentsService: jasmine.SpyObj<AttachmentsService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockTagService = jasmine.createSpyObj('TagService', ['getAllTags']);
    mockFileHandler = jasmine.createSpyObj('FileHandlerFacadeService', [
      'onFilesSelected',
      'uploadFiles',
      'removeFile',
      'uploadedFiles',
      'pendingFiles',
      'isUploading',
      'uploadProgress',
      'getFiles',
      'initialize',
      'handleUploadSuccess',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);
    mockAttachmentsService = jasmine.createSpyObj('AttachmentsService', [
      'getFilesByEntity',
    ]);

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockTagService.getAllTags.and.returnValue(of([]));
    mockFileHandler.uploadedFiles.and.returnValue([]);
    mockFileHandler.pendingFiles.and.returnValue([]);
    mockFileHandler.isUploading.and.returnValue(false);
    mockFileHandler.uploadProgress.and.returnValue(0);
    mockFileHandler.getFiles.and.returnValue({ uploaded: [], pending: [] });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatSliderModule,
        MatListModule,
        MatIconModule,
        MatProgressBarModule,
        FileUploadListComponent,
      ],
      declarations: [ProjectGeneralInformationComponent],
      providers: [
        { provide: TagService, useValue: mockTagService },
        { provide: FileHandlerFacadeService, useValue: mockFileHandler },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AttachmentsService, useValue: mockAttachmentsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectGeneralInformationComponent);
    component = fixture.componentInstance;

    const formGroup = new FormGroup({
      title: new FormControl(''),
      progress: new FormControl(0),
      description: new FormControl(''),
      tags: new FormControl([]),
      attachments: new FormControl([]),
    });
    fixture.componentRef.setInput('generalInformationForm', formGroup);
    fixture.componentRef.setInput('entityType', 'project');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty files if no entityId', () => {
    expect(mockFileHandler.initialize).toHaveBeenCalledWith([]);
  });

  it('should fetch existing files when entityId exists', () => {
    const files = [{ id: '1', fileName: 'test.pdf' } as FileMetadataDTO];
    mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('123');
    mockAttachmentsService.getFilesByEntity.and.returnValue(of(files));

    fixture = TestBed.createComponent(ProjectGeneralInformationComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'generalInformationForm',
      new FormGroup({
        title: new FormControl(''),
        progress: new FormControl(0),
        description: new FormControl(''),
        tags: new FormControl([]),
        attachments: new FormControl([]),
      })
    );

    fixture.componentRef.setInput('entityType', ProjectType.PUBLICATION);
    fixture.detectChanges();

    expect(mockAttachmentsService.getFilesByEntity).toHaveBeenCalledWith(
      ProjectType.PUBLICATION,
      '123'
    );
    expect(mockFileHandler.initialize).toHaveBeenCalledWith(files);
  });

  it('should handle file selection', () => {
    const files = [new File([''], 'test.pdf')];
    component.onFilesSelected(files);
    expect(mockFileHandler.onFilesSelected).toHaveBeenCalledWith(files);
  });

  it('should upload files when uploadFiles is called', () => {
    const files = [new File([''], 'test.pdf')];
    mockFileHandler.pendingFiles.and.returnValue(files);
    mockFileHandler.uploadFiles.and.returnValue(of({ files: [] }));

    component.uploadFiles();

    expect(mockFileHandler.uploadFiles).toHaveBeenCalledWith(
      ProjectType.PUBLICATION,
      ''
    );
  });

  it('should show error when uploadFiles called without entityType', () => {
    fixture.componentRef.setInput('entityType', undefined);
    component.uploadFiles();
    expect(mockNotificationService.showError).toHaveBeenCalled();
  });

  it('should remove file', () => {
    const mockObservable = of({});
    mockFileHandler.removeFile.and.returnValue(mockObservable);

    component.removeFile(0, true);
    expect(mockFileHandler.removeFile).toHaveBeenCalledWith(0, true);
  });

  it('should compare tags correctly', () => {
    expect(component.compareTags('1', '1')).toBeTrue();
    expect(component.compareTags('1', '2')).toBeFalse();
  });

  it('should update form control when files change', () => {
    const formControlSpy = spyOn(
      component.generalInformationForm().controls.attachments,
      'setValue'
    );
    mockFileHandler.getFiles.and.returnValue({
      uploaded: ['file1'],
      pending: ['file2'],
    });

    component.updateFormControl();

    expect(formControlSpy).toHaveBeenCalledWith(['file1', 'file2'], undefined);
  });
});
