import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrorComponentComponent } from './form-error-component.component';
import { FormControl, Validators } from '@angular/forms';
import { MatError } from '@angular/material/form-field';

describe('FormErrorComponentComponent', () => {
  let component: FormErrorComponentComponent;
  let fixture: ComponentFixture<FormErrorComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorComponentComponent, MatError],
    }).compileComponents();

    fixture = TestBed.createComponent(FormErrorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show errors when control is valid', () => {
    const control = new FormControl('valid', Validators.required);
    component.control = control;
    component.errors = [{ key: 'required', message: 'This field is required' }];
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement).toBeNull();
  });

  it('should show error message when control is invalid and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    component.errors = [{ key: 'required', message: 'This field is required' }];
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('This field is required');
  });

  it('should show correct error message for multiple errors', () => {
    const control = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);
    control.markAsTouched();
    component.control = control;
    component.errors = [
      { key: 'required', message: 'This field is required' },
      { key: 'minlength', message: 'Minimum length is 3' },
    ];
    fixture.detectChanges();

    let errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement.textContent).toContain('This field is required');

    control.setValue('a');
    fixture.detectChanges();

    errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement.textContent).toContain('Minimum length is 3');
  });
});
