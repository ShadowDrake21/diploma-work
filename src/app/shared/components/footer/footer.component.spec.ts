import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display copyright text with link', () => {
    const link = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(link.textContent).toContain(
      '© Дипломна робота, Крапивʼянський Дмитро, 2025'
    );
    expect(link.href).toContain('https://github.com/ShadowDrake21');
    expect(link.target).toBe('_blank');
  });

  it('should have proper CSS classes', () => {
    const footer = fixture.debugElement.query(By.css('footer')).nativeElement;
    expect(footer.classList).toContain('absolute');
    expect(footer.classList).toContain('bottom-0');
    expect(footer.classList).toContain('text-center');
    expect(footer.classList).toContain('w-full');
  });
});
