import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForbiddenComponent } from './forbidden.component';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';

describe('ForbiddenComponent', () => {
  let component: ForbiddenComponent;
  let fixture: ComponentFixture<ForbiddenComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ForbiddenComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForbiddenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 403 Forbidden message', () => {
    const title = fixture.debugElement.query(By.css('h1')).nativeElement;
    const subtitle = fixture.debugElement.query(By.css('h2')).nativeElement;

    expect(title.textContent).toContain('403 Заборонено');
    expect(subtitle.textContent).toContain(
      'У вас немає дозволу на доступ до цього ресурсу.'
    );
  });

  it('should have a back button', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent).toContain('Назад');
  });

  describe('onGoBack', () => {
    it('should navigate to home when user is authenticated', () => {
      authServiceMock.getCurrentUser.and.returnValue({
        id: 1,
        name: 'Test User',
      });

      component.onGoBack();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to authentication when user is not authenticated', () => {
      authServiceMock.getCurrentUser.and.returnValue(null);

      component.onGoBack();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/authentication']);
    });

    it('should call onGoBack when button is clicked', () => {
      spyOn(component, 'onGoBack');
      const button = fixture.debugElement.query(By.css('button'));
      button.triggerEventHandler('click', null);

      expect(component.onGoBack).toHaveBeenCalled();
    });
  });

  it('should have proper styling classes', () => {
    const container = fixture.debugElement.query(By.css('div')).nativeElement;
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(container.classList).toContain('h-screen');
    expect(container.classList).toContain('flex');
    expect(container.classList).toContain('flex-col');
    expect(container.classList).toContain('items-center');
    expect(container.classList).toContain('justify-center');
    expect(container.classList).toContain('overflow-hidden');

    expect(button.classList).toContain('text-xl');
    expect(button.classList).toContain('p-3');
    expect(button.classList).toContain('border');
    expect(button.classList).toContain('border-solid');
    expect(button.classList).toContain('border-black');
    expect(button.classList).toContain('text-black');
    expect(button.classList).toContain('bg-transparent');
    expect(button.classList).toContain('no-underline');
    expect(button.classList).toContain('transition-all');
    expect(button.classList).toContain('duration-500');
    expect(button.classList).toContain('ease-in-out');
    expect(button.classList).toContain('hover:text-white');
    expect(button.classList).toContain('hover:bg-black');
    expect(button.classList).toContain('active:text-white');
    expect(button.classList).toContain('active:bg-black');
  });
});
