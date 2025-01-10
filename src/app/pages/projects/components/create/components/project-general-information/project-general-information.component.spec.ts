import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGeneralInformationComponent } from './project-general-information.component';

describe('ProjectGeneralInformationComponent', () => {
  let component: ProjectGeneralInformationComponent;
  let fixture: ComponentFixture<ProjectGeneralInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectGeneralInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
