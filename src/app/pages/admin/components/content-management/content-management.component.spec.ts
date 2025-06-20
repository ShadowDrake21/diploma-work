import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentManagementComponent } from './content-management.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MockModule, MockComponent } from 'ng-mocks';
import { CommentsTableComponent } from './components/comments-table/comments-table.component';
import { ProjectTableComponent } from './components/project-table/project-table.component';

describe('ContentManagementComponent', () => {
  let component: ContentManagementComponent;
  let fixture: ComponentFixture<ContentManagementComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MockModule(MatTabsModule),
        MockComponent(ProjectTableComponent),
        MockComponent(CommentsTableComponent),
      ],
      declarations: [ContentManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render mat-tab-group with two tabs', () => {
    const tabGroup = fixture.nativeElement.querySelector('mat-tab-group');
    expect(tabGroup).toBeTruthy();

    const tabs = fixture.nativeElement.querySelectorAll('mat-tab');
    expect(tabs.length).toBe(2);

    expect(tabs[0].getAttribute('label')).toBe('Проєкти');
    expect(tabs[1].getAttribute('label')).toBe('Коментарі');
  });

  it('should render project-table component in first tab', () => {
    const projectTable =
      fixture.nativeElement.querySelector('app-project-table');
    expect(projectTable).toBeTruthy();
  });

  it('should render comments-table component in second tab', () => {
    const commentsTable =
      fixture.nativeElement.querySelector('app-comments-table');
    expect(commentsTable).toBeTruthy();
  });
});
