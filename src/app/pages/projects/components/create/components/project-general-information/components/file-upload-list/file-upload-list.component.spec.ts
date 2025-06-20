import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadListComponent } from './file-upload-list.component';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { By } from '@angular/platform-browser';
import { NotificationService } from '@core/services/notification.service';
import { FileMetadataDTO } from '@models/file.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { ProjectType } from '@shared/enums/categories.enum';

describe('FileUploadListComponent', () => {
  let component: FileUploadListComponent;
  let fixture: ComponentFixture<FileUploadListComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatProgressBarModule,
        MatListModule,
        MatButtonModule,
        FileUploadListComponent,
      ],
      providers: [
        DatePipe,
        FileSizePipe,
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadListComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('uploadedFiles', []);
    fixture.componentRef.setInput('pendingFiles', []);
    fixture.componentRef.setInput('isUploading', false);
    fixture.componentRef.setInput('uploadProgress', 0);
    fixture.componentRef.setInput('isEditing', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filesSelected event when files are selected', () => {
    const emitSpy = spyOn(component.filesSelected, 'emit');
    const mockFile = new File([''], 'test.pdf');
    const event = {
      target: {
        files: [mockFile],
        value: '',
      },
    } as unknown as Event;

    component.handleFileSelection(event);

    expect(emitSpy).toHaveBeenCalledWith([mockFile]);
  });

  it('should show error when file exceeds size limit', () => {
    const largeFile = new File([''], 'large.pdf');
    Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024 });
    const event = {
      target: {
        files: [largeFile],
        value: '',
      },
    } as unknown as Event;

    component.handleFileSelection(event);

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Some files exceed the 20MB size limit'
    );
  });

  it('should emit removeFile event when removing a file', () => {
    const emitSpy = spyOn(component.removeFile, 'emit');
    component.handleRemoveFile(0, true);
    expect(emitSpy).toHaveBeenCalledWith({ index: 0, isPending: true });
  });

  it('should emit uploadRequested when upload button is clicked', () => {
    const emitSpy = spyOn(component.uploadRequested, 'emit');

    fixture.componentRef.setInput('pendingFiles', [new File([''], 'test.pdf')]);

    fixture.componentRef.setInput('isEditing', true);

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[color="accent"]'));
    button.triggerEventHandler('click', null);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should disable upload button when no pending files', () => {
    fixture.componentRef.setInput('pendingFiles', []);

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[color="accent"]'));
    expect(button.nativeElement.disabled).toBeTrue();
  });

  it('should show progress bar when uploading', () => {
    fixture.componentRef.setInput('isUploading', true);
    fixture.detectChanges();

    const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
    expect(progressBar).toBeTruthy();
  });

  it('should display uploaded files correctly', () => {
    const mockFile: FileMetadataDTO = {
      fileUrl: 'http://example.com/file.pdf',
      fileName: 'file.pdf',
      fileSize: 1024,
      uploadedAt: new Date().toISOString(),
      id: '1',
      entityType: ProjectType.PUBLICATION,
      entityId: '1',
    };

    fixture.componentRef.setInput('uploadedFiles', [mockFile]);

    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems.length).toBe(1);
    expect(listItems[0].nativeElement.textContent).toContain('file.pdf');
  });

  it('should display pending files correctly', () => {
    const mockFile = new File([''], 'pending.pdf');
    fixture.componentRef.setInput('pendingFiles', [mockFile]);

    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems.length).toBe(1);
    expect(listItems[0].nativeElement.textContent).toContain('pending.pdf');
  });
});
