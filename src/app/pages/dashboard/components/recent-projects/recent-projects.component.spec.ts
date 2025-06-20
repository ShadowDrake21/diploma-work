import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentProjectsComponent } from './recent-projects.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { of, throwError } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';

describe('RecentProjectsComponent', () => {
  let component: RecentProjectsComponent;
  let fixture: ComponentFixture<RecentProjectsComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getNewestProjects',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RecentProjectsComponent,
        MatIconModule,
        MatProgressSpinnerModule,
        ProjectCardComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    const mockProjects: ProjectDTO[] = [
      {
        id: '1',
        title: 'Project 1',
        description: 'Desc 1',
        createdAt: new Date().toISOString(),
        type: ProjectType.PUBLICATION,
        progress: 50,
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
      {
        id: '2',
        title: 'Project 2',
        description: 'Desc 2',
        createdAt: new Date().toISOString(),
        type: ProjectType.PUBLICATION,
        progress: 50,
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
    ];
    mockProjectService.getNewestProjects.and.returnValue(
      of({ success: true, data: mockProjects })
    );

    fixture.detectChanges();

    expect(mockProjectService.getNewestProjects).toHaveBeenCalledWith(6);
    expect(component.projects()).toEqual(mockProjects);
    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeFalse();
  });

  it('should handle API error when loading projects', () => {
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
    });
    mockProjectService.getNewestProjects.and.returnValue(
      throwError(() => errorResponse)
    );

    fixture.detectChanges();

    expect(component.hasError()).toBeTrue();
    expect(component.errorMessage()).toContain('Не вдалося завантажити');
    expect(mockNotificationService.showError).toHaveBeenCalled();
  });

  it('should handle network error', () => {
    const errorResponse = new HttpErrorResponse({ status: 0 });
    mockProjectService.getNewestProjects.and.returnValue(
      throwError(() => errorResponse)
    );

    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Помилка мережі');
    expect(component.hasError()).toBeTrue();
  });

  it('should handle 404 error', () => {
    const errorResponse = new HttpErrorResponse({ status: 404 });
    mockProjectService.getNewestProjects.and.returnValue(
      throwError(() => errorResponse)
    );

    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Не знайдено');
    expect(component.hasError()).toBeTrue();
  });

  it('should retry loading when retry button is clicked', () => {
    const mockProjects: ProjectDTO[] = [
      {
        id: '3',
        title: 'Project 3',
        description: 'Desc 3',
        createdAt: new Date().toISOString(),
        type: ProjectType.PATENT,
        progress: 30,
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
    ];
    mockProjectService.getNewestProjects.and.returnValue(
      of({ success: true, data: mockProjects })
    );

    component.retryLoading();

    expect(mockProjectService.getNewestProjects).toHaveBeenCalledTimes(1);
    expect(component.projects()).toEqual(mockProjects);
  });

  it('should display projects when loaded', () => {
    component.projects.set([
      {
        id: '1',
        title: 'Project 1',
        description: 'Desc 1',
        createdAt: new Date().toISOString(),
        type: ProjectType.RESEARCH,
        progress: 50,
        updatedAt: new Date().toISOString(),
        tagIds: [],
        createdBy: 1,
      },
    ]);
    component.isLoading.set(false);
    fixture.detectChanges();

    const projectCards = fixture.nativeElement.querySelectorAll(
      'shared-project-card'
    );
    expect(projectCards.length).toBe(1);
  });

  it('should display no projects message when projects array is empty', () => {
    component.projects.set([]);
    component.isLoading.set(false);
    fixture.detectChanges();

    const noProjectsMessage = fixture.nativeElement.querySelector('p');
    expect(noProjectsMessage.textContent).toContain(
      'Не знайдено жодних останніх проектів'
    );
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalled();
    expect(component.destroy$.complete).toHaveBeenCalled();
  });
});
