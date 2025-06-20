import { TestBed } from '@angular/core/testing';

import { HeaderService } from './header.service';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('HeaderService', () => {
  let service: HeaderService;
  let routerMock: any;
  const navigationEndEvents = new BehaviorSubject<any>(null);

  beforeEach(() => {
    routerMock = {
      events: navigationEndEvents.asObservable(),
      navigate: jasmine.createSpy('navigate'),
    };

    TestBed.configureTestingModule({
      providers: [HeaderService, { provide: Router, useValue: routerMock }],
    });

    service = TestBed.inject(HeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default title', () => {
    expect(service['headerTitle$$'].value).toBe(
      'Система обліку науково-технічної продукції'
    );
  });

  describe('setTitle', () => {
    it('should update the header title', () => {
      const testTitle = 'Test Title';
      service.setTitle(testTitle);
      expect(service['headerTitle$$'].value).toBe(testTitle);
    });
  });

  describe('resetDefaultTitle', () => {
    it('should reset title to default', () => {
      service.setTitle('Some other title');
      service.resetDefaultTitle();
      expect(service['headerTitle$$'].value).toBe(
        'Система обліку науково-технічної продукції'
      );
    });
  });

  describe('route navigation', () => {
    it('should set title based on exact route match', () => {
      const url = '/projects/create';
      navigationEndEvents.next(new NavigationEnd(1, url, url));
      expect(service['headerTitle$$'].value).toBe('Створити проект');
    });

    it('should set title based on startsWith match', () => {
      const url = '/projects/123';
      navigationEndEvents.next(new NavigationEnd(1, url, url));
      expect(service['headerTitle$$'].value).toBe('Проекти');
    });

    it('should use default title when no route matches', () => {
      const url = '/unknown-route';
      navigationEndEvents.next(new NavigationEnd(1, url, url));
      expect(service['headerTitle$$'].value).toBe(
        'Система обліку науково-технічної продукції'
      );
    });

    it('should ignore query parameters and fragments when matching routes', () => {
      const url = '/users?param=value#fragment';
      navigationEndEvents.next(new NavigationEnd(1, url, url));
      expect(service['headerTitle$$'].value).toBe('Користувачі');
    });
  });

  describe('findMatchingRoute', () => {
    it('should prioritize exact matches over startsWith matches', () => {
      const url = '/projects/list';
      const result = service['findMatchingRoute'](url);
      expect(result?.title).toBe('Список проектів');
    });

    it('should return undefined when no match found', () => {
      const url = '/non-existent-route';
      const result = service['findMatchingRoute'](url);
      expect(result).toBeUndefined();
    });
  });

  it('should unsubscribe from router events on destroy', () => {
    spyOn(service['routerSubscription'], 'unsubscribe');
    service.ngOnDestroy();
    expect(service['routerSubscription'].unsubscribe).toHaveBeenCalled();
  });
});
