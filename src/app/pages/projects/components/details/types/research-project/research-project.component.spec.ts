import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchProjectComponent } from './research-project.component';
import {
  DatePipe,
  CurrencyPipe,
  TitleCasePipe,
  AsyncPipe,
} from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { ResearchDTO, ResearchStatuses } from '@models/research.model';
import { ParticipantDTO } from '@models/user.model';
import { of, throwError } from 'rxjs';

describe('ResearchProjectComponent', () => {
  let component: ResearchProjectComponent;
  let fixture: ComponentFixture<ResearchProjectComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockResearch: ResearchDTO = {
    id: '1',
    budget: 100000,
    startDate: new Date('2023-01-01').toISOString(),
    endDate: new Date('2023-12-31').toISOString(),
    status: ResearchStatuses.IN_PROGRESS,
    fundingSource: 'National Science Foundation',
    participantIds: [1, 2, 3],
    projectId: '1',
  };

  const mockParticipants: ParticipantDTO[] = [
    {
      id: 1,
      username: 'Researcher 1',
      avatarUrl: '',
    },
    {
      id: 2,
      username: 'Researcher 2',
      avatarUrl: '',
    },
    {
      id: 3,
      username: 'Researcher 3',
      avatarUrl: '',
    },
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getResearchByProjectId',
    ]);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserById']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ResearchProjectComponent,
        MatProgressBarModule,
        MatExpansionModule,
        DatePipe,
        CurrencyPipe,
        TitleCasePipe,
        AsyncPipe,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchProjectComponent);
    component = fixture.componentInstance;
    component.id = '1';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load research details and participants successfully', () => {
    mockProjectService.getResearchByProjectId.and.returnValue(of(mockResearch));
    mockUserService.getUserById
      .withArgs(1)
      .and.returnValue(of(mockParticipants[0]));
    mockUserService.getUserById
      .withArgs(2)
      .and.returnValue(of(mockParticipants[1]));
    mockUserService.getUserById
      .withArgs(3)
      .and.returnValue(of(mockParticipants[2]));

    fixture.detectChanges();

    expect(component.researchError).toBeFalse();
    expect(component.participantsError).toBeFalse();
  });

  it('should handle research load error', () => {
    const error = new Error('Failed to load research');
    mockProjectService.getResearchByProjectId.and.returnValue(
      throwError(() => error)
    );

    fixture.detectChanges();

    expect(component.researchError).toBeTrue();
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити деталі дослідження'
    );

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement.textContent).toContain(
      'Не вдалося завантажити деталі дослідження'
    );
  });

  it('should handle participants load error', () => {
    mockProjectService.getResearchByProjectId.and.returnValue(of(mockResearch));
    mockUserService.getUserById.and.returnValue(
      throwError(() => new Error('Failed to load participant'))
    );

    fixture.detectChanges();

    expect(component.participantsError).toBeTrue();
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити деяких учасників'
    );

    const errorElement = fixture.nativeElement.querySelector('.text-red-500');
    expect(errorElement.textContent).toContain(
      'Не вдалося завантажити деякі дані учасників'
    );
  });

  it('should display research details when loaded', () => {
    mockProjectService.getResearchByProjectId.and.returnValue(of(mockResearch));
    mockUserService.getUserById.and.returnValue(of(mockParticipants[0]));

    fixture.detectChanges();

    const budgetElement =
      fixture.nativeElement.querySelectorAll('p')[0].textContent;
    expect(budgetElement).toContain('$100,000.00');

    const statusElement =
      fixture.nativeElement.querySelectorAll('p')[3].textContent;
    expect(statusElement).toContain('Active');
  });

  it('should show participants in expansion panel', () => {
    mockProjectService.getResearchByProjectId.and.returnValue(of(mockResearch));
    mockUserService.getUserById
      .withArgs(1)
      .and.returnValue(of(mockParticipants[0]));
    mockUserService.getUserById
      .withArgs(2)
      .and.returnValue(of(mockParticipants[1]));
    mockUserService.getUserById
      .withArgs(3)
      .and.returnValue(of(mockParticipants[2]));

    fixture.detectChanges();

    const participants = fixture.nativeElement.querySelectorAll('li');
    expect(participants.length).toBe(3);
    expect(participants[0].textContent).toContain('Researcher 1');
    expect(participants[1].textContent).toContain('Researcher 2');
    expect(participants[2].textContent).toContain('Researcher 3');
  });

  it('should show loading state initially', () => {
    mockProjectService.getResearchByProjectId.and.returnValue(of(mockResearch));
    mockUserService.getUserById.and.returnValue(of(mockParticipants[0]));

    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
  });
});
