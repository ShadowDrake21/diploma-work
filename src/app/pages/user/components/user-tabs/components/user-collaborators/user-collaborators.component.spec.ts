import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCollaboratorsComponent } from './user-collaborators.component';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { of, throwError } from 'rxjs';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

describe('UserCollaboratorsComponent', () => {
  let component: UserCollaboratorsComponent;
  let fixture: ComponentFixture<UserCollaboratorsComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockCollaborators: IUser[] = [
    {
      id: 2,
      username: 'collab1',
      role: UserRole.USER,
      email: 'collab1@example.com',
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
    {
      id: 2,
      username: 'collab2',
      role: UserRole.ADMIN,
      email: 'collab2@example.com',
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getUserCollaborators',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [UserCollaboratorsComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCollaboratorsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('userId', 1);
    mockUserService.getUserCollaborators.and.returnValue(of(mockCollaborators));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collaborators when userId is set', () => {
    expect(mockUserService.getUserCollaborators).toHaveBeenCalledWith(1, 0, 10);
    expect(component.collaborators()).toEqual(mockCollaborators);
    expect(component.totalItems()).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should handle collaborator load error', () => {
    mockUserService.getUserCollaborators.and.returnValue(
      throwError(() => new Error('Error'))
    );
    fixture.componentRef.setInput('userId', 1);

    expect(component.error()).toBe('Не вдалося завантажити співавторів');
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити співавторів'
    );
    expect(component.loading()).toBeFalse();
  });

  it('should update pagination and reload on page change', () => {
    const pageEvent = { pageIndex: 1, pageSize: 5 } as PageEvent;
    component.onPageChange(pageEvent);

    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(5);
    expect(mockUserService.getUserCollaborators).toHaveBeenCalledWith(1, 1, 5);
  });
});
