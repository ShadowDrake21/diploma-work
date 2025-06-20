import { NotificationService } from '@core/services/notification.service';
import { PatentDTO } from '@models/patent.model';
import { PublicationDTO } from '@models/publication.model';
import { ResearchDTO, ResearchStatuses } from '@models/research.model';
import { ProjectService } from '../models/project.service';
import { UserRole } from '@shared/enums/user.enum';
import { TestBed } from '@angular/core/testing';
import { TypedProjectsService } from './typed-projects.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { of, throwError } from 'rxjs';

describe('TypedProjectsService', () => {
  let service: TypedProjectsService;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockPublication: PublicationDTO = {
    id: '1',
    authors: [
      {
        id: 1,
        username: 'author1',
      },
    ],
    projectId: '1',
    publicationDate: new Date().toISOString(),
    publicationSource: 'Journal of Testing',
    doiIsbn: '10.1000/xyz123',
    startPage: 1,
    endPage: 10,
    journalVolume: 1,
    issueNumber: 1,
  };

  const mockPatent: PatentDTO = {
    id: '1',
    projectId: '1',
    primaryAuthorId: 1,
    primaryAuthor: {
      id: 1,
      username: 'primaryAuthor',
      email: 'primary@example.com',
      role: UserRole.USER,
      affiliation: 'Some University',
      publicationCount: 0,
      patentCount: 1,
      researchCount: 0,
      tags: [],
      active: true,
    },
    registrationNumber: '123-456',
    registrationDate: new Date(),
    issuingAuthority: 'some authority',
    coInventors: [],
  };

  const mockResearch: ResearchDTO = {
    id: '1',
    participantIds: [1],
    projectId: '1',
    budget: 100000,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: ResearchStatuses.PROPOSED,
    fundingSource: 'Government Grant',
  };

  beforeEach(() => {
    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'getPublicationByProjectId',
      'getPatentByProjectId',
      'getResearchByProjectId',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TypedProjectsService,
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    service = TestBed.inject(TypedProjectsService);
  });

  describe('getPublication', () => {
    it('should return publication data on success', (done) => {
      projectServiceMock.getPublicationByProjectId.and.returnValue(
        of(mockPublication)
      );

      service.getPublication('1').subscribe((result) => {
        expect(result).toEqual(mockPublication);
        expect(notificationServiceMock.showError).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error and show notification', (done) => {
      projectServiceMock.getPublicationByProjectId.and.returnValue(
        throwError(() => new Error('Error'))
      );

      service.getPublication('1').subscribe((result) => {
        expect(result).toBeNull();
        expect(notificationServiceMock.showError).toHaveBeenCalledWith(
          'Не вдалося завантажити деталі публікації'
        );
        done();
      });
    });
  });

  describe('getPatent', () => {
    it('should return patent data on success', (done) => {
      projectServiceMock.getPatentByProjectId.and.returnValue(of(mockPatent));

      service.getPatent('1').subscribe((result) => {
        expect(result).toEqual(mockPatent);
        expect(notificationServiceMock.showError).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error and show notification', (done) => {
      projectServiceMock.getPatentByProjectId.and.returnValue(
        throwError(() => new Error('Error'))
      );

      service.getPatent('1').subscribe((result) => {
        expect(result).toBeNull();
        expect(notificationServiceMock.showError).toHaveBeenCalledWith(
          'Не вдалося завантажити інформацію про патент'
        );
        done();
      });
    });
  });

  describe('getResearch', () => {
    it('should return research data on success', (done) => {
      projectServiceMock.getResearchByProjectId.and.returnValue(
        of(mockResearch)
      );

      service.getResearch('1').subscribe((result) => {
        expect(result).toEqual(mockResearch);
        expect(notificationServiceMock.showError).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle error and show notification', (done) => {
      projectServiceMock.getResearchByProjectId.and.returnValue(
        throwError(() => new Error('Error'))
      );

      service.getResearch('1').subscribe((result) => {
        expect(result).toBeNull();
        expect(notificationServiceMock.showError).toHaveBeenCalledWith(
          'Не вдалося завантажити деталі дослідження'
        );
        done();
      });
    });
  });

  describe('getTypedProject', () => {
    it('should return publication for PUBLICATION type', (done) => {
      projectServiceMock.getPublicationByProjectId.and.returnValue(
        of(mockPublication)
      );

      service
        .getTypedProject<PublicationDTO>('1', ProjectType.PUBLICATION)
        .subscribe((result) => {
          expect(result).toEqual(mockPublication);
          done();
        });
    });

    it('should return patent for PATENT type', (done) => {
      projectServiceMock.getPatentByProjectId.and.returnValue(of(mockPatent));

      service
        .getTypedProject<PatentDTO>('1', ProjectType.PATENT)
        .subscribe((result) => {
          expect(result).toEqual(mockPatent);
          done();
        });
    });

    it('should return research for RESEARCH type', (done) => {
      projectServiceMock.getResearchByProjectId.and.returnValue(
        of(mockResearch)
      );

      service
        .getTypedProject<ResearchDTO>('1', ProjectType.RESEARCH)
        .subscribe((result) => {
          expect(result).toEqual(mockResearch);
          done();
        });
    });

    it('should handle invalid project type', (done) => {
      const invalidType = 'INVALID' as ProjectType;

      service.getTypedProject('1', invalidType).subscribe((result) => {
        expect(result).toBeNull();
        expect(notificationServiceMock.showError).toHaveBeenCalledWith(
          'Недійсний тип проекту'
        );
        done();
      });
    });
  });
});
