import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ProjectsQuickLinksComponent } from '@shared/components/projects-quick-links/projects-quick-links.component';
import { BasicStatsComponent } from './components/basic-stats/basic-stats.component';
import { OnlineUsersComponent } from './components/online-users/online-users.component';
import { RecentProjectsComponent } from './components/recent-projects/recent-projects.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatProgressSpinnerModule,
        OnlineUsersComponent,
        ProjectsQuickLinksComponent,
        RecentProjectsComponent,
        BasicStatsComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have host class binding', () => {
    const element = fixture.nativeElement;
    expect(element.classList).toContain('flex');
    expect(element.classList).toContain('flex-col');
    expect(element.classList).toContain('min-h-[100vh]');
    expect(element.classList).toContain('h-full');
  });

  it('should render all child components', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('dashboard-basic-stats')).toBeTruthy();
    expect(compiled.querySelector('shared-projects-quick-links')).toBeTruthy();
    expect(compiled.querySelector('dashboard-recent-projects')).toBeTruthy();
    expect(compiled.querySelector('dashboard-online-users')).toBeTruthy();
  });
});
