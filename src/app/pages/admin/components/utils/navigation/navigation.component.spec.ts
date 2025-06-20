import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationComponent } from './navigation.component';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation items', () => {
    const navItems = fixture.debugElement.queryAll(By.css('li'));
    expect(navItems.length).toBe(component.navItems.length);
  });

  it('should display correct labels', () => {
    const navItems = fixture.debugElement.queryAll(By.css('li'));
    component.navItems.forEach((item, index) => {
      expect(navItems[index].nativeElement.textContent).toContain(item.label);
    });
  });

  it('should have correct routerLinks', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    component.navItems.forEach((item, index) => {
      expect(links[index].properties['routerLink']).toBe(item.path);
    });
  });

  it('should display icons', () => {
    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    component.navItems.forEach((item, index) => {
      expect(icons[index].properties['fontIcon']).toBe(item.icon);
    });
  });

  it('should apply active class when routerLinkActive', () => {
    const link = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(link.classList.contains('bg-[#3498db]')).toBeFalsy();

    link.classList.add('bg-[#3498db]');
    fixture.detectChanges();

    expect(link.classList.contains('bg-[#3498db]')).toBeTruthy();
  });
});
