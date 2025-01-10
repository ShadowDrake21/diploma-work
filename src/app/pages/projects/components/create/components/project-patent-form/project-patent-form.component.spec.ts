import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPatentFormComponent } from './project-patent-form.component';

describe('ProjectPatentFormComponent', () => {
  let component: ProjectPatentFormComponent;
  let fixture: ComponentFixture<ProjectPatentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPatentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPatentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
