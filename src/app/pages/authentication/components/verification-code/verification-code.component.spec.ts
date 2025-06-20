import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { VerificationCodeComponent } from './verification-code.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { of, throwError } from 'rxjs';

describe('VerificationCodeComponent', () => {
  let component: VerificationCodeComponent;
  let fixture: ComponentFixture<VerificationCodeComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['verifyUser']);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteMock = {
      queryParams: of({ email: 'test@example.com' }),
    };

    await TestBed.configureTestingModule({
      imports: [VerificationCodeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty input values', () => {
    expect(component.inputValues().length).toBe(6);
    expect(component.inputValues().every((v) => v === '')).toBeTrue();
  });

  it('should load email from query params', fakeAsync(() => {
    tick();
    expect(component.email()).toBe('test@example.com');
  }));

  it('should handle invalid key inputs', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    spyOn(event, 'preventDefault');
    component.handleKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle valid key inputs', () => {
    const event = new KeyboardEvent('keydown', { key: '1' });
    spyOn(event, 'preventDefault');
    component.handleKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should update input values on key up', () => {
    const input = document.createElement('input');
    input.value = '1';
    const event = new KeyboardEvent('keyup', { key: '1' });
    Object.defineProperty(event, 'target', { value: input });

    component.handleKeyUp(event, 0);
    expect(component.inputValues()[0]).toBe('1');
  });

  it('should focus next input on value entry', () => {
    const parent = document.createElement('div');
    const currentInput = document.createElement('input');
    const nextInput = document.createElement('input');
    parent.appendChild(currentInput);
    parent.appendChild(nextInput);

    spyOn(nextInput, 'focus');
    spyOn(nextInput, 'select');

    component.focusNextInput(currentInput, parent);
    expect(nextInput.focus).toHaveBeenCalled();
    expect(nextInput.select).toHaveBeenCalled();
  });

  it('should focus previous input on backspace', () => {
    const parent = document.createElement('div');
    const prevInput = document.createElement('input');
    const currentInput = document.createElement('input');
    parent.appendChild(prevInput);
    parent.appendChild(currentInput);

    spyOn(prevInput, 'focus');
    spyOn(prevInput, 'select');

    component.focusPreviousInput(currentInput, parent);
    expect(prevInput.focus).toHaveBeenCalled();
    expect(prevInput.select).toHaveBeenCalled();
  });

  it('should not submit with incomplete code', () => {
    component.inputValues.set(['1', '2', '3', '', '', '']);
    component.onSubmit();
    expect(authServiceMock.verifyUser).not.toHaveBeenCalled();
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Будь ласка, введіть дійсний 6-значний код'
    );
  });

  it('should handle successful verification', fakeAsync(() => {
    authServiceMock.verifyUser.and.returnValue(of({}));
    component.inputValues.set(['1', '2', '3', '4', '5', '6']);

    component.onSubmit();
    tick();

    expect(authServiceMock.verifyUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
    });
    expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
      'Перевірка успішна'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle invalid code error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 400 });
    authServiceMock.verifyUser.and.returnValue(throwError(() => error));
    component.inputValues.set(['1', '2', '3', '4', '5', '6']);

    component.onSubmit();
    tick();

    expect(component.verificationMessage()).toBe(
      'Недійсний код підтвердження. Спробуйте ще раз.'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle email not found error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 404 });
    authServiceMock.verifyUser.and.returnValue(throwError(() => error));
    component.inputValues.set(['1', '2', '3', '4', '5', '6']);

    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Електронну адресу не знайдено. Будь ласка, запитайте новий код підтвердження.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/sign-up',
    ]);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle expired code error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 410 });
    authServiceMock.verifyUser.and.returnValue(throwError(() => error));
    component.inputValues.set(['1', '2', '3', '4', '5', '6']);

    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Термін дії коду підтвердження закінчився. Будь ласка, запитайте новий.'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/request-verification',
    ]);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle rate limit error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 429 });
    authServiceMock.verifyUser.and.returnValue(throwError(() => error));
    component.inputValues.set(['1', '2', '3', '4', '5', '6']);

    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Забагато спроб. Будь ласка, спробуйте пізніше.'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle generic error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 500 });
    authServiceMock.verifyUser.and.returnValue(throwError(() => error));
    component.inputValues.set(['1', '2', '3', '4', '5', '6']);

    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Не вдалося перевірити. Спробуйте ще раз.'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should unsubscribe on destroy', () => {
    spyOn(component as any, 'subscription');
    component.ngOnDestroy();
    expect((component as any).subscription?.unsubscribe).toHaveBeenCalled();
  });
});
