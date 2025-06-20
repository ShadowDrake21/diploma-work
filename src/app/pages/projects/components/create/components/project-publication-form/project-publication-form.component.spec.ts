import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPublicationFormComponent } from './project-publication-form.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { AuthorNamePipe } from '@pipes/author-name.pipe';
import { of } from 'rxjs';

describe('ProjectPublicationFormComponent', () => {
  let component: ProjectPublicationFormComponent;
  let fixture: ComponentFixture<ProjectPublicationFormComponent>;
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
      declarations: [ProjectPublicationFormComponent, AuthorNamePipe],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPublicationFormComponent);
    component = fixture.componentInstance;

    // Initialize the required input
    const formGroup = new FormGroup({
      authors: new FormControl([]),
      publicationDate: new FormControl(null),
      publicationSource: new FormControl(null),
      doiIsbn: new FormControl(null),
      startPage: new FormControl(null),
      endPage: new FormControl(null),
      journalVolume: new FormControl(null),
      issueNumber: new FormControl(null),
    });
    fixture.componentRef.setInput('publicationsForm', formGroup);

    mockUserService.getAllUsers.and.returnValue(
      of([
        { id: '1', username: 'Author 1' },
        { id: '2', username: 'Author 2' },
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

  it('should show error when authors is invalid and touched', () => {
    const formControl = component.publicationsForm().controls.authors;
    formControl.markAsTouched();
    formControl.setErrors({ required: true });
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error.textContent).toContain(component.formErrors.authors.required);
  });

  it('should disable next button when form is invalid', () => {
    component.publicationsForm().controls.authors.setErrors({ required: true });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[matStepperNext]'
    );
    expect(button.disabled).toBeTrue();
  });

  it('should display author names in select trigger', () => {
    component.publicationsForm().controls.authors.setValue([1]);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.mat-select-trigger');
    expect(trigger.textContent).toContain('Author 1');
  });
});
