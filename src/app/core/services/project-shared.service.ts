import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProjectSharedService {
  public isProjectCreation: boolean = false;
  constructor() {}
}
