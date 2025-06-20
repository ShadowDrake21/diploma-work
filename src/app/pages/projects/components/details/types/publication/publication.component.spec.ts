import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationComponent } from './publication.component';
import { DatePipe, AsyncPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { PublicationDTO } from '@models/publication.model';
import { of, throwError } from 'rxjs';

describe('PublicationComponent', () => {
  let component: PublicationComponent;
  let fixture: ComponentFixture<PublicationComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockPublication: PublicationDTO = {
    id: '1',
    publicationDate: new Date('2023-01-15').toISOString(),
    publicationSource: 'Journal of Science',
    doiIsbn: 'DOI12345',
    startPage: 1,
    endPage: 10,
    journalVolume: 12,
    issueNumber: 2,
    authors: [
      { id: 1, username: 'Author 1' },
      { id: 2, username: 'Author 2' },
    ],
    projectId: '1',
  };

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getPublicationByProjectId',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PublicationComponent,
        MatProgressBarModule,
        MatExpansionModule,
        DatePipe,
        AsyncPipe,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicationComponent);
    component = fixture.componentInstance;
    component.id = '1';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load publication details successfully', () => {
    mockProjectService.getPublicationByProjectId.and.returnValue(
      of(mockPublication)
    );

    fixture.detectChanges();

    expect(component.error).toBeFalse();

    const publicationSource =
      fixture.nativeElement.querySelector('p').textContent;
    expect(publicationSource).toContain(mockPublication.publicationSource);
  });

  it('should handle publication load error', () => {
    const error = new Error('Failed to load publication');
    mockProjectService.getPublicationByProjectId.and.returnValue(
      throwError(() => error)
    );

    fixture.detectChanges();

    expect(component.error).toBeTrue();
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити деталі публікації'
    );

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement.textContent).toContain(
      'Не вдалося завантажити деталі публікації'
    );
  });

  it('should show loading state initially', () => {
    mockProjectService.getPublicationByProjectId.and.returnValue(
      of(mockPublication)
    );

    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
  });

  it('should display publication details when loaded', () => {
    mockProjectService.getPublicationByProjectId.and.returnValue(
      of(mockPublication)
    );

    fixture.detectChanges();

    const authorsHeader = fixture.nativeElement.querySelector('h4').textContent;
    expect(authorsHeader).toContain('Автори');

    const doiElement =
      fixture.nativeElement.querySelectorAll('p')[2].textContent;
    expect(doiElement).toContain(mockPublication.doiIsbn);
  });

  it('should show authors in expansion panel', () => {
    mockProjectService.getPublicationByProjectId.and.returnValue(
      of(mockPublication)
    );

    fixture.detectChanges();

    const authors = fixture.nativeElement.querySelectorAll('li');
    expect(authors.length).toBe(2);
    expect(authors[0].textContent).toContain('Author 1');
    expect(authors[1].textContent).toContain('Author 2');
  });
});
