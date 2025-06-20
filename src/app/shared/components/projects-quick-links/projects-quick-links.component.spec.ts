import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsQuickLinksComponent } from './projects-quick-links.component';

describe('ProjectsQuickLinksComponent', () => {
  let component: ProjectsQuickLinksComponent;
  let fixture: ComponentFixture<ProjectsQuickLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsQuickLinksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsQuickLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mode and button text', () => {
    const initialText = component.buttonText;
    const initialParams = component.toggleLinkParams;

    component.toggleMode();
    fixture.detectChanges();

    expect(component.buttonText).not.toBe(initialText);
    expect(component.toggleLinkParams).not.toEqual(initialParams);
  });

  it('should have correct create project link', () => {
    const createLink = fixture.nativeElement.querySelector('a:first-child');
    expect(createLink.getAttribute('routerLink')).toBe('/projects/create');
  });

  it('should update toggle link params when mode changes', () => {
    component.toggleMode();
    fixture.detectChanges();

    const toggleLink = fixture.nativeElement.querySelector('a:last-child');
    expect(toggleLink.getAttribute('queryParams')).toEqual(
      JSON.stringify(component.toggleLinkParams)
    );
  });
});
