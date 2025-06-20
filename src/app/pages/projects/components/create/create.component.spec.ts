import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectComponent } from './create.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService } from '@core/services/header.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectLoaderService } from '@core/services/project/project-creation/project-loader.service';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { UserService } from '@core/services/users/user.service';
import { IUser } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;
  let mockHeaderService: jasmine.SpyObj<HeaderService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockProjectLoaderService: jasmine.SpyObj<ProjectLoaderService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockProjectFormService: jasmine.SpyObj<ProjectFormService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockHeaderService = jasmine.createSpyObj('HeaderService', ['setTitle']);
    mockUserService = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    mockProjectLoaderService = jasmine.createSpyObj('ProjectLoaderService', [
      'loadProject',
      'clearAllForms',
      'typeForm',
      'generalInformationForm',
      'publicationsForm',
      'patentsForm',
      'researchesForm',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);
    mockProjectFormService = jasmine.createSpyObj('ProjectFormService', [], {
      isEditing: false,
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        MatStepperModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        CreateProjectComponent,
      ],
      providers: [
        { provide: HeaderService, useValue: mockHeaderService },
        { provide: UserService, useValue: mockUserService },
        { provide: ProjectLoaderService, useValue: mockProjectLoaderService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ProjectFormService, useValue: mockProjectFormService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title and subtext', () => {
    expect(mockHeaderService.setTitle).toHaveBeenCalledWith(
      'Створити новий запис'
    );
    expect(component.subtext).toBe(
      'Виберіть тип запису, який ви хочете створити, та надайте необхідну інформацію.'
    );
  });

  it('should get current user on init', () => {
    const mockUser: IUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    };
    mockUserService.getCurrentUser.and.returnValue(of(mockUser));

    component.ngOnInit();

    expect(mockUserService.getCurrentUser).toHaveBeenCalled();
    expect(component.creatorId).toEqual(1);
  });

  it('should handle error when loading user fails', () => {
    mockUserService.getCurrentUser.and.returnValue(
      throwError(() => new Error('Failed'))
    );

    component.ngOnInit();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити інформацію про користувача'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('when editing existing project', () => {
    beforeEach(() => {
      mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('123');
      mockProjectLoaderService.loadProject.and.returnValue(of({}));
    });

    it('should set editing mode and load project', () => {
      component.ngOnInit();

      expect(mockProjectFormService.isEditing).toBeTrue();
      expect(mockHeaderService.setTitle).toHaveBeenCalledWith(
        'Редагувати проєкт: 123'
      );
      expect(mockProjectLoaderService.loadProject).toHaveBeenCalledWith('123');
      expect(component.loading).toBeFalse();
    });

    it('should handle error when loading project fails', () => {
      mockProjectLoaderService.loadProject.and.returnValue(
        throwError(() => ({ status: 404 }))
      );

      component.ngOnInit();

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Проєкт не знайдено'
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
    });
  });

  it('should clean up on destroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    component.subscriptions.push(mockSubscription);

    component.ngOnDestroy();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.subscriptions.length).toBe(0);
    expect(mockProjectLoaderService.clearAllForms).toHaveBeenCalled();
  });
});
