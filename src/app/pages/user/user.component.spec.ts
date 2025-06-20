import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { UserProfileComponent } from './user.component';
import { UserRole } from '@shared/enums/user.enum';
import { ProjectType } from '@shared/enums/categories.enum';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockHeaderService: jasmine.SpyObj<HeaderService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockActivatedRoute: any;

  const mockUser: IUser = {
    id: 1,
    username: 'testuser',
    role: UserRole.USER,
    affiliation: 'Test University',
    email: 'test@example.com',
    publicationCount: 5,
    patentCount: 3,
    researchCount: 2,
    avatarUrl: 'http://example.com/avatar.jpg',
    tags: [],
    active: true,
  };

  const mockProjects: ProjectDTO[] = [
    {
      id: '1',
      title: 'Project 1',
      type: ProjectType.PUBLICATION,
      description: '',
      progress: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
    {
      id: '2',
      title: 'Project 2',
      type: ProjectType.PUBLICATION,
      description: '',
      progress: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getFullUserById',
      'getUserProjects',
    ]);
    mockHeaderService = jasmine.createSpyObj('HeaderService', ['setTitle']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    mockActivatedRoute = {
      params: of({ id: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: UserService, useValue: mockUserService },
        { provide: HeaderService, useValue: mockHeaderService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;

    mockUserService.getFullUserById.and.returnValue(of(mockUser));
    mockUserService.getUserProjects.and.returnValue(of(mockProjects));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(component.userId()).toBe(1);
    expect(mockUserService.getFullUserById).toHaveBeenCalledWith(1);
    expect(component.user()).toEqual(mockUser);
    expect(mockHeaderService.setTitle).toHaveBeenCalledWith(
      'Користувач: testuser'
    );
  });

  it('should load user projects after user data is loaded', () => {
    expect(mockUserService.getUserProjects).toHaveBeenCalledWith(1);
    expect(component.userProjects()).toEqual(mockProjects);
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle user load error', () => {
    mockUserService.getFullUserById.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.loadUserData();

    expect(component.error()).toBe('Не вдалося завантажити дані користувача');
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити профіль користувача'
    );
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle projects load error', () => {
    mockUserService.getUserProjects.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.loadUserProjects();

    expect(component.error()).toBe(
      'Не вдалося завантажити проекти користувачів'
    );
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити проекти користувачів'
    );
    expect(component.isLoading()).toBeFalse();
  });

  it('should generate correct metrics', () => {
    const metrics = component.userMetrics();
    expect(metrics.length).toBe(3);
    expect(metrics[0].title).toBe('Публікації');
    expect(metrics[0].value).toBe('5');
    expect(metrics[1].title).toBe('Патенти');
    expect(metrics[1].value).toBe('3');
    expect(metrics[2].title).toBe('Дослідницькі проекти');
    expect(metrics[2].value).toBe('2');
  });

  it('should retry loading when retryLoading is called', () => {
    component.error.set('Test error');
    component.retryLoading();

    expect(component.error()).toBeNull();
    expect(mockUserService.getFullUserById).toHaveBeenCalledTimes(2);
  });
});
