import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatentComponent } from './patent.component';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { PatentDTO } from '@models/patent.model';
import { IUser } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('PatentComponent', () => {
  let component: PatentComponent;
  let fixture: ComponentFixture<PatentComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockPatent: PatentDTO = {
    id: '1',
    registrationNumber: 'US12345',
    registrationDate: new Date('2023-01-01'),
    issuingAuthority: 'USPTO',
    primaryAuthor: {
      id: 1,
      username: 'Primary Inventor',
      email: 'inventor@example.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
    coInventors: [2, 3],
    projectId: '1',
    primaryAuthorId: 0,
  };

  const mockCoInventors: IUser[] = [
    {
      id: 2,
      username: 'Co-Inventor 1',
      email: 'coinventor1@example.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
    {
      id: 3,
      username: 'Co-Inventor 2',
      email: 'coinventor1@example.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getPatentByProjectId',
    ]);
    mockUserService = jasmine.createSpyObj('UserService', ['getFullUserById']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PatentComponent,
        MatProgressBarModule,
        MatButtonModule,
        MatExpansionModule,
        DatePipe,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatentComponent);
    component = fixture.componentInstance;
    component.id = '1';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    mockProjectService.getPatentByProjectId.and.returnValue(of(mockPatent));
    mockUserService.getFullUserById.and.returnValue(of(mockCoInventors[0]));

    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
    expect(component.loading()).toBeTrue();
  });

  it('should load patent details and co-inventors successfully', () => {
    mockProjectService.getPatentByProjectId.and.returnValue(of(mockPatent));
    mockUserService.getFullUserById
      .withArgs(2)
      .and.returnValue(of(mockCoInventors[0]));
    mockUserService.getFullUserById
      .withArgs(3)
      .and.returnValue(of(mockCoInventors[1]));

    fixture.detectChanges();

    expect(component.patent()).toEqual(mockPatent);
    expect(component.coInventors()).toEqual(mockCoInventors);
    expect(component.loading()).toBeFalse();
    expect(component.error).toBeFalse();
  });

  it('should handle patent load error', () => {
    const error = new Error('Failed to load patent');
    mockProjectService.getPatentByProjectId.and.returnValue(
      throwError(() => error)
    );

    fixture.detectChanges();

    expect(component.error).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити інформацію про патент'
    );

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement.textContent).toContain(
      'Не вдалося завантажити інформацію про патент'
    );
  });

  it('should handle co-inventors load error', () => {
    mockProjectService.getPatentByProjectId.and.returnValue(of(mockPatent));
    mockUserService.getFullUserById.and.returnValue(
      throwError(() => new Error('Failed to load user'))
    );

    fixture.detectChanges();

    expect(component.coInventors()).toEqual([]);
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити співвинахідників'
    );
  });

  it('should display patent details when loaded', () => {
    mockProjectService.getPatentByProjectId.and.returnValue(of(mockPatent));
    mockUserService.getFullUserById.and.returnValue(of(mockCoInventors[0]));

    fixture.detectChanges();

    const registrationNumber =
      fixture.nativeElement.querySelector('p').textContent;
    expect(registrationNumber).toContain(mockPatent.registrationNumber);

    const coInventorsHeader =
      fixture.nativeElement.querySelector('h4').textContent;
    expect(coInventorsHeader).toContain('Співвинахідники');
  });

  it('should retry loading when retry button is clicked', () => {
    const error = new Error('Failed to load patent');
    mockProjectService.getPatentByProjectId.and.returnValues(
      throwError(() => error),
      of(mockPatent)
    );
    mockUserService.getFullUserById.and.returnValue(of(mockCoInventors[0]));

    fixture.detectChanges();

    const retryButton = fixture.nativeElement.querySelector('button');
    retryButton.click();
    fixture.detectChanges();

    expect(mockProjectService.getPatentByProjectId).toHaveBeenCalledTimes(2);
  });

  it('should show "No patent information" when patent is null', () => {
    mockProjectService.getPatentByProjectId.and.returnValue(of(null));

    fixture.detectChanges();

    const noInfoElement = fixture.nativeElement.querySelector('.text-black');
    expect(noInfoElement.textContent).toContain('Немає інформації про патент');
  });
});
