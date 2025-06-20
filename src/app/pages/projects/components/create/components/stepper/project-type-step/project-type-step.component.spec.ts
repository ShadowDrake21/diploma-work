import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeStepComponent } from './project-type-step.component';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

describe('ProjectTypeStepComponent', () => {
  let component: ProjectTypeStepComponent;
  let fixture: ComponentFixture<ProjectTypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTypeStepComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTypeStepComponent);
    component = fixture.componentInstance;

    const typeForm = new FormGroup({});
    component.typeForm = jest.fn(() => typeForm) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render project-type component when typeForm is provided', () => {
    const typeFormElement = fixture.nativeElement.querySelector(
      'create-project-type'
    );
    expect(typeFormElement).toBeTruthy();
  });

  it('should pass the typeForm to the child component', () => {
    const mockForm = new FormGroup({});
    component.typeForm = jest.fn(() => mockForm) as any;

    fixture.detectChanges();

    const typeFormElement = fixture.nativeElement.querySelector(
      'create-project-type'
    );
    expect(typeFormElement.getAttribute('ng-reflect-type-form')).toBeDefined();
  });
});
