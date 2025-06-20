import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeComponent } from './project-type.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProjectTypeComponent', () => {
  let component: ProjectTypeComponent;
  let fixture: ComponentFixture<ProjectTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        MatStepperModule,
      ],
      declarations: [ProjectTypeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTypeComponent);
    component = fixture.componentInstance;

    const formGroup = new FormGroup({
      type: new FormControl<ProjectType | null>(null),
    });
    fixture.componentRef.setInput('typeForm', formGroup);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all type options', () => {
    const select = fixture.nativeElement.querySelector('mat-select');
    select.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('mat-option');
    expect(options.length).toBe(component.types.length);
  });

  it('should show error when type is not selected and touched', () => {
    const formControl = component.typeForm().controls.type;
    formControl.markAsTouched();
    formControl.setErrors({ required: true });
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error.textContent).toContain(component.formErrors.type.required);
  });

  it('should disable next button when form is invalid', () => {
    component.typeForm().controls.type.setErrors({ required: true });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[matStepperNext]'
    );
    expect(button.disabled).toBeTrue();
  });
});
