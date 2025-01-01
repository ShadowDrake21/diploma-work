import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private headerTitleSub = new BehaviorSubject<string>(
    'Система обліку науково-технічної продукції'
  );
  public headerTitle$ = this.headerTitleSub.asObservable();

  setTitle(title: string) {
    this.headerTitleSub.next(title);
  }
}
