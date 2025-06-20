import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleChipComponent } from './user-role-chip.component';
import { UserRole } from '@shared/enums/user.enum';
import { RoleFormatPipe } from '@pipes/role-format.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { By } from '@angular/platform-browser';

describe('UserRoleChipComponent', () => {
  let component: UserRoleChipComponent;
  let fixture: ComponentFixture<UserRoleChipComponent>;

  beforeEach(async () => {
    const mockRoleFormatPipe = {
      transform: (value: string) => value,
    };

    await TestBed.configureTestingModule({
      imports: [UserRoleChipComponent, MatChipsModule],
      providers: [{ provide: RoleFormatPipe, useValue: mockRoleFormatPipe }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserRoleChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default USER role', () => {
    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('User');
  });

  it('should display ADMIN role correctly', () => {
    fixture.componentRef.setInput('role', UserRole.ADMIN);
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('Admin');
    expect(chip.classList).toContain('mat-accent');
  });

  it('should display SUPER_ADMIN role correctly', () => {
    fixture.componentRef.setInput('role', UserRole.SUPER_ADMIN);
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.textContent.trim()).toBe('Super Admin');
    expect(chip.classList).toContain('mat-primary');
  });

  it('should have no special color for USER role', () => {
    fixture.componentRef.setInput('role', UserRole.USER);
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(chip.classList).not.toContain('mat-accent');
    expect(chip.classList).not.toContain('mat-primary');
  });

  it('should use RoleFormatPipe', () => {
    const pipe = TestBed.inject(RoleFormatPipe);
    spyOn(pipe, 'transform').and.returnValue('Formatted Role');

    fixture.componentRef.setInput('role', UserRole.ADMIN);
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip')).nativeElement;
    expect(pipe.transform).toHaveBeenCalled();
    expect(chip.textContent.trim()).toBe('Formatted Role');
  });
});
