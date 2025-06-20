import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectWorkInfoStepComponent } from './project-work-info-step.component';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

describe('ProjectWorkInfoStepComponent', () => {
  let component: ProjectWorkInfoStepComponent;
  let fixture: ComponentFixture<ProjectWorkInfoStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectWorkInfoStepComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectWorkInfoStepComponent);
    component = fixture.componentInstance;

    const typeForm = new FormGroup({});
    typeForm.setValue({ type: 'PUBLICATION' });
    component.typeForm = jest.fn(() => typeForm) as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render publication form when type is PUBLICATION', () => {
    const publicationForm = new FormGroup({});
    component.publicationsForm = jest.fn(() => publicationForm) as any;
    component.authors = jest.fn(() => []) as any;

    fixture.detectChanges();

    const publicationFormElement = fixture.nativeElement.querySelector(
      'create-project-publication-form'
    );
    expect(publicationFormElement).toBeTruthy();
  });

  it('should render patent form when type is PATENT', () => {
    const typeForm = new FormGroup({});
    typeForm.setValue({ type: 'PATENT' });
    component.typeForm = jest.fn(() => typeForm) as any;

    const patentForm = new FormGroup({});
    component.patentsForm = jest.fn(() => patentForm) as any;
    component.authors = jest.fn(() => []) as any;

    fixture.detectChanges();

    const patentFormElement = fixture.nativeElement.querySelector(
      'create-project-patent-form'
    );
    expect(patentFormElement).toBeTruthy();
  });

  it('should render research form when type is RESEARCH', () => {
    const typeForm = new FormGroup({});
    typeForm.setValue({ type: 'RESEARCH' });
    component.typeForm = jest.fn(() => typeForm) as any;

    const researchForm = new FormGroup({});
    component.researchesForm = jest.fn(() => researchForm) as any;
    component.authors = jest.fn(() => []) as any;

    fixture.detectChanges();

    const researchFormElement = fixture.nativeElement.querySelector(
      'create-project-research-form'
    );
    expect(researchFormElement).toBeTruthy();
  });

  it('should not render any form when type is invalid', () => {
    const typeForm = new FormGroup({});
    typeForm.setValue({ type: 'INVALID_TYPE' });
    component.typeForm = jest.fn(() => typeForm) as any;

    fixture.detectChanges();

    const formElements = fixture.nativeElement.querySelectorAll('form');
    expect(formElements.length).toBe(0);
  });
});
