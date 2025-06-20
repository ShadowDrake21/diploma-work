import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentUsersComponent } from './recent-users.component';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@core/services/users/user.service';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { of } from 'rxjs';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';
describe('RecentUsersComponent', () => {
  let component: RecentUsersComponent;
  let fixture: ComponentFixture<RecentUsersComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getRecentlyActiveUsers',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RecentUsersComponent,
        MatIconModule,
        TruncateTextPipe,
        LoaderComponent,
      ],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user list when users are loaded', () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        username: 'user1',
        avatarUrl: '',
        role: UserRole.USER,
        lastActive: new Date(),
        email: 'user1@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    mockUserService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));
    component.isLoading.set(false);
    fixture.detectChanges();

    const userItems = fixture.nativeElement.querySelectorAll('li');
    expect(userItems.length).toBe(1);
    expect(userItems[0].textContent).toContain('user1');
  });

  it('should display different icons based on user role', () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        username: 'user1',
        avatarUrl: '',
        role: UserRole.SUPER_ADMIN,
        lastActive: new Date(),
        email: 'user1@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
      {
        id: 2,
        username: 'user2',
        avatarUrl: '',
        role: UserRole.ADMIN,
        lastActive: new Date(),
        email: 'user2@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
      {
        id: 3,
        username: 'user3',
        avatarUrl: '',
        role: UserRole.USER,
        lastActive: new Date(),
        email: 'user3@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    mockUserService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));
    component.isLoading.set(false);
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('mat-icon');
    expect(icons[0].textContent).toContain('workspace_premium');
    expect(icons[1].textContent).toContain('verified_user');
    expect(icons[2].textContent).toContain('person');
  });

  it('should display refresh button', () => {
    fixture.detectChanges();
    const refreshButton = fixture.nativeElement.querySelector(
      'button[mat-icon-button]'
    );
    expect(refreshButton).toBeTruthy();
  });

  it('should call refreshActiveUsers when refresh button is clicked', () => {
    spyOn(component, 'refreshActiveUsers');
    fixture.detectChanges();

    const refreshButton = fixture.nativeElement.querySelector(
      'button[mat-icon-button]'
    );
    refreshButton.click();

    expect(component.refreshActiveUsers).toHaveBeenCalled();
  });

  it('should display default avatar when avatarUrl is not provided', () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        username: 'user1',
        avatarUrl: '',
        role: UserRole.USER,
        lastActive: new Date(),
        email: 'user1@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    mockUserService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));
    component.isLoading.set(false);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('assets/default-avatar.png');
  });

  it('should display no users message when activeUsers is empty', () => {
    mockUserService.getRecentlyActiveUsers.and.returnValue(of([]));
    component.isLoading.set(false);
    fixture.detectChanges();

    const noUsersMessage = fixture.nativeElement.querySelector('p');
    expect(noUsersMessage.textContent).toContain(
      'Активних користувачів не знайдено'
    );
  });
});
