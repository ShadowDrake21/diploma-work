import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentUsersComponent } from './recent-users.component';
import { signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { of, throwError } from 'rxjs';

describe('RecentUsersComponent', () => {
  let component: RecentUsersComponent;
  let fixture: ComponentFixture<RecentUsersComponent>;
  let adminServiceMock: jasmine.SpyObj<AdminService>;

  const mockRecentLogins = [
    {
      username: 'testuser',
      email: 'test@example.com',
      loginTime: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome',
    },
  ];

  const mockLoginStats = 42;

  beforeEach(async () => {
    adminServiceMock = jasmine.createSpyObj('AdminService', [
      'getRecentLogins',
      'getLoginStats',
      'resetState',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        LoaderComponent,
        RecentUsersComponent,
      ],
      providers: [{ provide: AdminService, useValue: adminServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load recent logins and stats on init', () => {
      adminServiceMock.getRecentLogins.and.returnValue(of(mockRecentLogins));
      adminServiceMock.getLoginStats.and.returnValue(of(mockLoginStats));

      fixture.detectChanges();

      expect(adminServiceMock.getRecentLogins).toHaveBeenCalled();
      expect(adminServiceMock.getLoginStats).toHaveBeenCalled();
    });

    it('should handle error when loading data', () => {
      const errorMessage = 'Failed to load data';
      adminServiceMock.getRecentLogins.and.returnValue(
        throwError(() => errorMessage)
      );
      adminServiceMock.getLoginStats.and.returnValue(
        throwError(() => errorMessage)
      );
      spyOnProperty(adminServiceMock, 'error', 'get').and.returnValue(
        () => errorMessage
      );

      fixture.detectChanges();

      expect(component.error()).toBe(errorMessage);
    });
  });

  describe('retryLoadData', () => {
    it('should reset state and reload data', () => {
      adminServiceMock.getRecentLogins.and.returnValue(of(mockRecentLogins));
      adminServiceMock.getLoginStats.and.returnValue(of(mockLoginStats));

      component.retryLoadData();

      expect(adminServiceMock.resetState).toHaveBeenCalled();
      expect(adminServiceMock.getRecentLogins).toHaveBeenCalled();
      expect(adminServiceMock.getLoginStats).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    it('should show loader when data is loading', () => {
      adminServiceMock.getRecentLogins.and.returnValue(of(null));
      adminServiceMock.getLoginStats.and.returnValue(of(null));

      fixture.detectChanges();

      const loader = fixture.nativeElement.querySelector('custom-loader');
      expect(loader).toBeTruthy();
    });

    it('should show error message when error occurs', () => {
      const errorMessage = 'Test error';
      spyOnProperty(adminServiceMock, 'error', 'get').and.returnValue(
        () => errorMessage
      );
      adminServiceMock.getRecentLogins.and.returnValue(
        throwError(() => errorMessage)
      );
      adminServiceMock.getLoginStats.and.returnValue(
        throwError(() => errorMessage)
      );

      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorElement.textContent).toContain(errorMessage);
    });

    it('should show stats when loaded', () => {
      adminServiceMock.getRecentLogins.and.returnValue(of(mockRecentLogins));
      adminServiceMock.getLoginStats.and.returnValue(of(mockLoginStats));

      fixture.detectChanges();

      const statsElement = fixture.nativeElement.querySelector(
        'mat-card-content div'
      );
      expect(statsElement.textContent).toContain(
        `${mockLoginStats} авторизацій`
      );
    });

    it('should show table when recent logins are loaded', () => {
      adminServiceMock.getRecentLogins.and.returnValue(of(mockRecentLogins));
      adminServiceMock.getLoginStats.and.returnValue(of(mockLoginStats));

      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
      const rows = fixture.nativeElement.querySelectorAll('mat-row');
      expect(rows.length).toBe(mockRecentLogins.length);
    });
  });
});
