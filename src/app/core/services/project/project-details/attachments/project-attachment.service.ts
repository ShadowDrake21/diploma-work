import { inject, Injectable, OnDestroy } from '@angular/core';
import { AttachmentsService } from '@core/services/attachments.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { Subject, BehaviorSubject, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectAttachmentService implements OnDestroy {
  private attachmentsService = inject(AttachmentsService);
  private destroyed$ = new Subject<void>();

  // State
  private _attachments = new BehaviorSubject<any[]>([]);
  attachments$ = this._attachments.asObservable();

  loadAttachments(type: ProjectType | undefined, projectId: string): void {
    if (!type) {
      this._attachments.next([]);
      return;
    }

    this.attachmentsService
      .getFilesByEntity(type, projectId)
      .pipe(
        catchError((error) => {
          console.error('Error fetching attachments:', error);
          return of([]);
        })
      )
      .subscribe((attachments) => this._attachments.next(attachments));
  }

  resetAttachments(): void {
    this._attachments.next([]);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
