import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { UserService } from '@core/services/user.service';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { IUser } from '@shared/models/user.model';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'user-collaborators',
  imports: [CommonModule, UserCardComponent, MatListModule, AsyncPipe],
  templateUrl: './user-collaborators.component.html',
  styleUrl: './user-collaborators.component.scss',
})
export class UserCollaboratorsComponent {
  private userService = inject(UserService);
  userId = input.required<number>();

  collaborators = toSignal(
    this.userService.getUserCollaborators(this.userId()).pipe(
      map((response) => response.data),
      catchError(() => of([] as IUser[]))
    ),
    { initialValue: [] }
  );
}
