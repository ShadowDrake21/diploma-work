import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationComponent } from './authentication.component';
import { By } from '@angular/platform-browser';

describe('AuthenticationComponent', () => {
  let component: AuthenticationComponent;
  let fixture: ComponentFixture<AuthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render login and register tabs', () => {
    const tabs = fixture.debugElement.queryAll(By.css('a'));
    expect(tabs.length).toBe(2);
    expect(tabs[0].nativeElement.textContent).toContain('Вхід');
    expect(tabs[1].nativeElement.textContent).toContain('Реєстрація');
  });

  it('should have router outlet', () => {
    const outlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(outlet).toBeTruthy();
  });

  it('should apply active styles when routerLinkActive', () => {
    const tabs = fixture.debugElement.queryAll(By.css('a'));
    const loginTab = tabs[0];

    // Simulate active state
    loginTab.triggerEventHandler('routerLinkActive', true);
    fixture.detectChanges();

    expect(loginTab.nativeElement.classList).toContain('text-red-600');
    expect(loginTab.nativeElement.classList).toContain('border-red-500');
  });
});
