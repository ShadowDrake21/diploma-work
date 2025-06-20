import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGeneralInfoStepComponent } from './project-general-info-step.component';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

describe('ProjectGeneralInfoStepComponent', () => {
  let component: ProjectGeneralInfoStepComponent;
  let fixture: ComponentFixture<ProjectGeneralInfoStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectGeneralInfoStepComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectGeneralInfoStepComponent);
    component = fixture.componentInstance;

    component.generalInfoForm = jest.fn(() => new FormGroup({})) as any;
    component.typeForm = jest.fn(() => new FormGroup({})) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render general information component when inputs are provided', () => {
    const generalInfoElement = fixture.nativeElement.querySelector(
      'create-project-general-information'
    );
    expect(generalInfoElement).toBeTruthy();
  });

  it('should pass correct inputs to child component', () => {
    const mockGeneralInfoForm = new FormGroup({});
    const mockTypeForm = new FormGroup({});
    mockTypeForm.setValue({ type: 'PUBLICATION' });

    component.generalInfoForm = jest.fn(() => mockGeneralInfoForm) as any;
    component.typeForm = jest.fn(() => mockTypeForm) as any;

    fixture.detectChanges();

    const generalInfoElement = fixture.nativeElement.querySelector(
      'create-project-general-information'
    );
    expect(
      generalInfoElement.getAttribute('ng-reflect-general-information-form')
    ).toBeDefined();
    expect(generalInfoElement.getAttribute('ng-reflect-entity-type')).toBe(
      'PUBLICATION'
    );
  });

  it('should not render if forms are not provided', () => {
    component.generalInfoForm = jest.fn(() => null) as any;
    component.typeForm = jest.fn(() => null) as any;

    fixture.detectChanges();

    const generalInfoElement = fixture.nativeElement.querySelector(
      'create-project-general-information'
    );
    expect(generalInfoElement).toBeFalsy();
  });
});
