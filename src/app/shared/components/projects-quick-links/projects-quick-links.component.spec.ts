import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsQuickLinksComponent } from './projects-quick-links.component';

describe('ProjectsQuickLinksComponent', () => {
  let component: ProjectsQuickLinksComponent;
  let fixture: ComponentFixture<ProjectsQuickLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsQuickLinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsQuickLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
