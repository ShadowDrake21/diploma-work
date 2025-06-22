import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  BehaviorSubject,
  filter,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';

export interface RouteTitleConfig {
  path: string;
  title: string;
  matchStrategy?: 'exact' | 'startsWith';
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService implements OnDestroy {
  private readonly defaultTitle = 'Система обліку науково-технічної продукції';
  private headerTitle$$ = new BehaviorSubject<string>(this.defaultTitle);
  public headerTitle$ = this.headerTitle$$.asObservable();
  private destroy$ = new Subject<void>();

  private routeTitles: RouteTitleConfig[] = [
    { path: '/projects', title: 'Проекти', matchStrategy: 'startsWith' },
    {
      path: '/projects/list',
      title: 'Список проектів',
      matchStrategy: 'exact',
    },
    {
      path: '/projects/create',
      title: 'Створити проект',
      matchStrategy: 'exact',
    },
    { path: '/users', title: 'Користувачі', matchStrategy: 'startsWith' },
    { path: '/my-profile', title: 'Мій профіль', matchStrategy: 'exact' },
    { path: '/my-comments', title: 'Мої коментарі', matchStrategy: 'exact' },
  ];

  constructor(private router: Router) {
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.setTitleFromRoute(event.urlAfterRedirects);
      });
  }

  setTitle(title: string) {
    this.headerTitle$$.next(title);
  }

  resetDefaultTitle() {
    this.headerTitle$$.next(this.defaultTitle);
  }

  private setTitleFromRoute(url: string) {
    const basePath = url.split('?')[0].split('#')[0];
    const matchedRoute = this.findMatchingRoute(basePath);

    this.headerTitle$$.next(matchedRoute?.title || this.defaultTitle);
  }

  private findMatchingRoute(url: string): RouteTitleConfig | undefined {
    const exactMatch = this.routeTitles.find(
      (route) => route.matchStrategy === 'exact' && url === route.path
    );
    if (exactMatch) return exactMatch;
    return this.routeTitles.find(
      (route) =>
        route.matchStrategy === 'startsWith' && url.startsWith(route.path)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
