import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatusChipComponent } from './user-status-chip.component';
import { MatChipsModule } from '@angular/material/chips';
import { By } from '@angular/platform-browser';

describe('UserStatusChipComponent', () => {
  let component: UserStatusChipComponent;
  let fixture: ComponentFixture<UserStatusChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStatusChipComponent, MatChipsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserStatusChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Active" when active is true', () => {
    component.active = true;
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('Active');
    expect(chip.classList).toContain('mat-primary');
  });

  it('should display "Inactive" when active is false', () => {
    component.active = false;
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('Inactive');
    expect(chip.classList).toContain('mat-warn');
  });

  it('should update when active status changes', () => {
    component.active = true;
    fixture.detectChanges();
    let chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('Active');

    component.active = false;
    fixture.detectChanges();
    chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('Inactive');
  });

  it('should have font-weight 500', () => {
    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(getComputedStyle(chip).fontWeight).toBe('500');
  });
});
