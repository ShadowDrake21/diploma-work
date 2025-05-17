import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { UserService } from '@core/services/user.service';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { IUser } from '@shared/models/user.model';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'user-collaborators',
  imports: [CommonModule, UserCardComponent, MatListModule],
  templateUrl: './user-collaborators.component.html',
  styleUrl: './user-collaborators.component.scss',
})
export class UserCollaboratorsComponent {
  private userService = inject(UserService);
  userId = input.required<number>();

  collaborators = signal<IUser[]>([]);

  constructor() {
    effect(() => {
      const userId = this.userId();
      if (userId) {
        this.loadCollaborators(userId);
      }
    });
  }

  private loadCollaborators(userId: number): void {
    this.userService
      .getUserCollaborators(this.userId())
      .pipe(catchError(() => of({ data: [] })))
      .subscribe((response) => {
        this.collaborators.set(response.data);
      });
  }
}
