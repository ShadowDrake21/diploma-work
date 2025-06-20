import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  const mockData = {
    message: 'Test message',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatButtonModule, ConfirmationDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: mockData }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the provided message', () => {
    const content = fixture.nativeElement.querySelector('mat-dialog-content p');
    expect(content.textContent).toContain('Test message');
  });

  it('should have two action buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      'mat-dialog-actions button'
    );
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Скасувати');
    expect(buttons[1].textContent).toContain('Видалити');
  });
});
