import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStepperComponent } from './project-stepper.component';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { of } from 'rxjs';

describe('ProjectStepperComponent', () => {
  let component: ProjectStepperComponent;
  let fixture: ComponentFixture<ProjectStepperComponent>;
  let mockProjectFormService: Partial<ProjectFormService>;
  let mockNotificationService: Partial<NotificationService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockProjectFormService = {
      authors: [],
      isEditing: false,
      submitForm: jest.fn().mockReturnValue(of([{ projectId: '123' }])),
      creatorId: 1,
    };

    mockNotificationService = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jest.fn().mockReturnValue(null),
        },
      } as any,
    };

    await TestBed.configureTestingModule({
      imports: [
        ProjectStepperComponent,
        ReactiveFormsModule,
        MatStepperModule,
        MatButtonModule,
        MatProgressBarModule,
      ],
      providers: [
        { provide: ProjectFormService, useValue: mockProjectFormService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        AsyncPipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectStepperComponent);
    component = fixture.componentInstance;

    component.typeForm = jest.fn(() => new FormGroup({})) as any;
    component.generalInfoForm = jest.fn(() => new FormGroup({})) as any;
    component.publicationForm = jest.fn(() => new FormGroup({})) as any;
    component.patentForm = jest.fn(() => new FormGroup({})) as any;
    component.researchForm = jest.fn(() => new FormGroup({})) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct subtext based on isEditing', () => {
    (mockProjectFormService.isEditing as any) = true;
    fixture.detectChanges();

    const subtextElement =
      fixture.nativeElement.querySelector('.create-subtext');
    expect(subtextElement.textContent).toContain('Відредагуйте свій проект');

    (mockProjectFormService.isEditing as any) = false;
    fixture.detectChanges();
    expect(subtextElement.textContent).toContain('Створити новий проект');
  });

  it('should call submitForm when submit button is clicked', () => {
    const submitSpy = jest.spyOn(component, 'submitForm');
    const button = fixture.nativeElement.querySelector(
      'button[mat-button]:last-child'
    );
    button.click();
    expect(submitSpy).toHaveBeenCalled();
  });

  it('should navigate to project page on successful submission', () => {
    component.submitForm();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', '123']);
    expect(mockNotificationService.showSuccess).toHaveBeenCalled();
  });

  it('should show error when form is invalid', () => {
    const invalidForm = new FormGroup({});
    invalidForm.setErrors({ invalid: true });
    component.typeForm = jest.fn(() => invalidForm) as any;

    component.submitForm();
    expect(mockNotificationService.showError).toHaveBeenCalled();
    expect(mockProjectFormService.submitForm).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    (mockProjectFormService.loading as any) = of(true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
  });
});
