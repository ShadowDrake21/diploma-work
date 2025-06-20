import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundComponent } from './not-found.component';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onGoBack', () => {
    it('should navigate to root when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.onGoBack();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to authentication when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      component.onGoBack();
      expect(router.navigate).toHaveBeenCalledWith(['/authentication']);
    });
  });

  describe('template', () => {
    it('should render the SVG with correct structure', () => {
      const svgElement = fixture.nativeElement.querySelector('svg');
      expect(svgElement).toBeTruthy();
      expect(svgElement.getAttribute('viewBox')).toBe(
        '0 0 541.17206 328.45184'
      );
    });

    it('should render the error text', () => {
      const errorText = fixture.nativeElement.querySelector('#errorText');
      expect(errorText).toBeTruthy();
      expect(errorText.textContent).toContain('O-o-oh! Щось зламалося.');
    });

    it('should render the back button', () => {
      const button = fixture.nativeElement.querySelector('#errorLink');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Назад');
    });

    it('should call onGoBack when button is clicked', () => {
      spyOn(component, 'onGoBack');
      const button = fixture.nativeElement.querySelector('#errorLink');
      button.click();
      expect(component.onGoBack).toHaveBeenCalled();
    });
  });

  describe('dependency injection', () => {
    it('should inject AuthService', () => {
      expect(component['authService']).toBeTruthy();
      expect(component['authService'] instanceof AuthService).toBeTruthy();
    });

    it('should inject Router', () => {
      expect(component['router']).toBeTruthy();
      expect(component['router'] instanceof Router).toBeTruthy();
    });
  });
});
