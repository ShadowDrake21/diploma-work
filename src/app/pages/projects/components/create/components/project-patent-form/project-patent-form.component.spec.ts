import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPatentFormComponent } from './project-patent-form.component';
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

describe('ProjectPatentFormComponent', () => {
  let component: ProjectPatentFormComponent;
  let fixture: ComponentFixture<ProjectPatentFormComponent>;
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
      declarations: [ProjectPatentFormComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPatentFormComponent);
    component = fixture.componentInstance;

    const formGroup = new FormGroup({
      primaryAuthor: new FormControl(null),
      coInventors: new FormControl([]),
      registrationNumber: new FormControl(null),
      registrationDate: new FormControl(null),
      issuingAuthority: new FormControl(null),
    });
    fixture.componentRef.setInput('patentsForm', formGroup);

    mockUserService.getAllUsers.and.returnValue(
      of([
        { id: 1, username: 'Inventor 1' },
        { id: 2, username: 'Inventor 2' },
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

  it('should show error when primaryAuthor is invalid and touched', () => {
    const formControl = component.patentsForm().controls.primaryAuthor;
    formControl.markAsTouched();
    formControl.setErrors({ required: true });
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error.textContent).toContain(
      component.formErrors.primaryAuthor.required
    );
  });

  it('should exclude primary author from co-inventors list', () => {
    component.patentsForm().controls.primaryAuthor.setValue(1);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelectorAll('mat-select')[1]; // co-inventors select
    select.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('mat-option');
    expect(options.length).toBe(1); // Only Inventor 2 should be available
    expect(options[0].textContent).toContain('Inventor 2');
  });

  it('should update selectedPrimaryAuthor when primaryAuthor changes', () => {
    component.patentsForm().controls.primaryAuthor.setValue(2);
    expect(component.selectedPrimaryAuthor).toBe(2);
  });
});
