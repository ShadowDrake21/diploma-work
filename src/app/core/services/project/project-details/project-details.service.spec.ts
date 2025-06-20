import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ProjectDetailsService } from './project-details.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectService } from '../models/project.service';
import { of, throwError } from 'rxjs';

describe('ProjectDetailsService', () => {
  let service: ProjectDetailsService;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockProject: ProjectDTO = {
    id: '1',
    title: 'Test Project',
    type: ProjectType.PUBLICATION,
    description: 'Test description',
    tagIds: ['1', '2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
    progress: 50,
  };
  beforeEach(() => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getProjectById',
      'deleteProject',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectDetailsService,
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    service = TestBed.inject(ProjectDetailsService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null project', (done) => {
    service.project$.subscribe((project) => {
      expect(project).toBeNull();
      done();
    });
  });

  it('should load project details successfully', fakeAsync(() => {
    projectServiceSpy.getProjectById.and.returnValue(of(mockProject));

    service.loadProjectDetails('1');
    tick();

    service.project$.subscribe((project) => {
      expect(project).toEqual(mockProject);
      expect(service.getCurrentProjectId()).toBe('1');
      expect(service.getCurrentProjectType()).toBe(ProjectType.PUBLICATION);
    });
  }));

  it('should handle project loading failure', fakeAsync(() => {
    projectServiceSpy.getProjectById.and.returnValue(
      throwError(() => new Error('Not found'))
    );

    service.loadProjectDetails('1');
    tick();

    service.project$.subscribe((project) => {
      expect(project).toBeNull();
      expect(service.getCurrentProjectId()).toBe('1');
    });
  }));

  it('should delete project successfully', fakeAsync(() => {
    projectServiceSpy.deleteProject.and.returnValue(of({}));

    service.deleteProject('1').subscribe(() => {
      expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith(
        'Проєкт успішно видалено'
      );
      expect(service.getCurrentProjectId()).toBeNull();
    });

    tick();
  }));

  it('should handle delete project failure - forbidden', fakeAsync(() => {
    const error = { status: 403 };
    projectServiceSpy.deleteProject.and.returnValue(throwError(() => error));

    service.deleteProject('1').subscribe({
      error: () => {
        expect(notificationServiceSpy.showError).toHaveBeenCalledWith(
          'У вас немає дозволу на видалення цього проєкту'
        );
      },
    });

    tick();
  }));

  it('should handle delete project failure - other error', fakeAsync(() => {
    const error = { status: 500 };
    projectServiceSpy.deleteProject.and.returnValue(throwError(() => error));

    service.deleteProject('1').subscribe({
      error: () => {
        expect(notificationServiceSpy.showError).toHaveBeenCalledWith(
          'Не вдалося видалити проєкт'
        );
      },
    });

    tick();
  }));

  it('should reset state', () => {
    projectServiceSpy.getProjectById.and.returnValue(of(mockProject));
    service.loadProjectDetails('1');

    service.resetState();

    service.project$.subscribe((project) => {
      expect(project).toBeNull();
    });
    expect(service.getCurrentProjectId()).toBeNull();
  });

  it('should complete destroyed$ on ngOnDestroy', () => {
    const destroyedSpy = spyOn(service['destroyed$'], 'next');
    const completeSpy = spyOn(service['destroyed$'], 'complete');

    service.ngOnDestroy();

    expect(destroyedSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
