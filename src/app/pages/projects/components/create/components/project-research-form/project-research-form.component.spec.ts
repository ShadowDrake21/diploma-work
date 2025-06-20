import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectResearchFormComponent } from './project-research-form.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { of } from 'rxjs';

describe('ProjectResearchFormComponent', () => {
  let component: ProjectResearchFormComponent;
  let fixture: ComponentFixture<ProjectResearchFormComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getAllUsers']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        MatStepperModule,
        MatInputModule,
        MatDatepickerModule,
      ],
      declarations: [ProjectResearchFormComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectResearchFormComponent);
    component = fixture.componentInstance;

    // Initialize the required input
    const formGroup = new FormGroup({
      participantIds: new FormControl([]),
      budget: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      status: new FormControl(null),
      fundingSource: new FormControl(null),
    });
    fixture.componentRef.setInput('researchProjectsForm', formGroup);

    mockUserService.getAllUsers.and.returnValue(
      of([
        { id: '1', username: 'User 1' },
        { id: '2', username: 'User 2' },
      ])
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    component.allUsers$.subscribe((users) => {
      expect(users?.length).toBe(2);
    });
  });

  it('should show error when participantIds is invalid and touched', () => {
    const formControl =
      component.researchProjectsForm().controls.participantIds;
    formControl.markAsTouched();
    formControl.setErrors({ required: true });
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error.textContent).toContain(
      component.formErrors.participantIds.required
    );
  });

  it('should disable next button when form is invalid', () => {
    component
      .researchProjectsForm()
      .controls.participantIds.setErrors({ required: true });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[matStepperNext]'
    );
    expect(button.disabled).toBeTrue();
  });

  it('should display all status options', () => {
    const select = fixture.nativeElement.querySelectorAll('mat-select')[4]; // 5th select is status
    select.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('mat-option');
    expect(options.length).toBe(component.statuses.length);
  });
});
