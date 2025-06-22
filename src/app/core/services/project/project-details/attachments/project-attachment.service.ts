import { inject, Injectable, OnDestroy } from '@angular/core';
import { AttachmentsService } from '@core/services/attachments.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { Subject, BehaviorSubject, catchError, of, tap, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectAttachmentService implements OnDestroy {
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  private _attachments = new BehaviorSubject<any[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);

  attachments$ = this._attachments.asObservable();
  loading$ = this._loading.asObservable();

  loadAttachments(type: ProjectType | undefined, projectId: string): void {
    if (!type) {
      this._attachments.next([]);
      return;
    }

    this._loading.next(true);

    this.attachmentsService
      .getFilesByEntity(type, projectId)
      .pipe(
        takeUntil(this.destroy$),
        tap({
          next: (attachments) => {
            this._attachments.next(attachments);
            this._loading.next(false);
          },
          error: (error) => {
            this._loading.next(false);
            this.notificationService.showError(
              'Не вдалося завантажити вкладені файли.'
            );
            console.error('Error loading attachments:', error);
          },
        }),
        catchError(() => of([]))
      )
      .subscribe();
  }

  resetAttachments(): void {
    this._attachments.next([]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
