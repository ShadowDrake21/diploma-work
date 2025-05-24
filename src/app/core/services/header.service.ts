import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly defaultTitle = 'Система обліку науково-технічної продукції';
  private headerTitle$$ = new BehaviorSubject<string>(this.defaultTitle);
  public headerTitle$ = this.headerTitle$$.asObservable();

  private routeTitles: { [key: string]: string } = {
    '/projects': 'Проекти',
    '/projects/list': 'Список проектів',
    '/projects/create': 'Створити проект',
    '/users': 'Користувачі',
    '/my-profile': 'Мій профіль',
    '/my-comments': 'Мої коментарі',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
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
    const basePath = url.split('?')[0];
    const matchedRoute = Object.keys(this.routeTitles).find((route) =>
      basePath.startsWith(route)
    );

    this.headerTitle$$.next(
      matchedRoute ? this.routeTitles[matchedRoute] : this.defaultTitle
    );
  }
}
