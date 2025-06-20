import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { Subject, of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: any;
  let mockAuthService: any;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();

    mockRouter = {
      events: routerEventsSubject.asObservable(),
      url: '/',
      navigate: jasmine.createSpy('navigate'),
    };

    mockAuthService = {
      isAuthenticated: jasmine
        .createSpy('isAuthenticated')
        .and.returnValue(true),
      isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
      currentUser$: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isMobile).toBeTrue();
      expect(component.isCollapsed).toBeTrue();
      expect(component.isOpened).toBeFalse();
      expect(component.isExpanded).toBeTrue();
      expect(component.isAuth).toBeTrue();
      expect(component.isSettings).toBeFalse();
      expect(component.isErrorPages).toBeFalse();
      expect(component.isLoggedIn).toBeTrue();
    });

    it('should subscribe to router events on init', () => {
      const navigationEndEvent = new NavigationEnd(1, '/test', '/test');
      routerEventsSubject.next(navigationEndEvent);

      expect(component.isAuth).toBeFalse();
    });

    it('should update isAdmin based on auth service', () => {
      expect(mockAuthService.isAdmin).toHaveBeenCalled();
    });
  });

  describe('URL path detection', () => {
    it('should set isAuth to true for authentication routes', () => {
      const event = new NavigationEnd(
        1,
        '/authentication/login',
        '/authentication/login'
      );
      routerEventsSubject.next(event);
      expect(component.isAuth).toBeTrue();
    });

    it('should set isSettings to true for settings routes', () => {
      const event = new NavigationEnd(
        1,
        '/settings/profile',
        '/settings/profile'
      );
      routerEventsSubject.next(event);
      expect(component.isSettings).toBeTrue();
    });

    it('should set isErrorPages to true for error routes', () => {
      const forbiddenEvent = new NavigationEnd(1, '/forbidden', '/forbidden');
      routerEventsSubject.next(forbiddenEvent);
      expect(component.isErrorPages).toBeTrue();

      const notFoundEvent = new NavigationEnd(1, '/not-found', '/not-found');
      routerEventsSubject.next(notFoundEvent);
      expect(component.isErrorPages).toBeTrue();
    });
  });

  describe('Sidebar functionality', () => {
    beforeEach(() => {
      // Mock the sidenav ViewChild
      component.sidenav = jasmine.createSpyObj('MatSidenav', [
        'close',
        'toggle',
      ]);
    });

    it('should close sidebar', () => {
      component.closeSidebar();
      expect(component.sidenav.close).toHaveBeenCalled();
      expect(component.isOpened).toBeFalse();
    });

    it('should toggle menu', () => {
      const initialValue = component.isOpened;
      component.toggleMenu();
      expect(component.sidenav.toggle).toHaveBeenCalled();
      expect(component.isOpened).toBe(!initialValue);
    });
  });

  describe('Template rendering', () => {
    it('should show header when not on auth/settings/error pages', () => {
      component.isAuth = false;
      component.isSettings = false;
      component.isErrorPages = false;
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('shared-header'));
      expect(header).toBeTruthy();
    });

    it('should hide header on auth pages', () => {
      component.isAuth = true;
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('shared-header'));
      expect(header).toBeNull();
    });

    it('should show admin link when user is admin', () => {
      component.isAdmin = true;
      component.isAuth = false;
      fixture.detectChanges();

      const adminLink = fixture.debugElement.query(
        By.css('a[routerLink="/admin/dashboard"]')
      );
      expect(adminLink).toBeTruthy();
    });

    it('should not show admin link when user is not admin', () => {
      component.isAdmin = false;
      component.isAuth = false;
      fixture.detectChanges();

      const adminLink = fixture.debugElement.query(
        By.css('a[routerLink="/admin/dashboard"]')
      );
      expect(adminLink).toBeNull();
    });
  });

  describe('Authentication state', () => {
    it('should update isLoggedIn when auth state changes', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      component.ngOnInit();
      expect(component.isLoggedIn).toBeFalse();
    });
  });
});
