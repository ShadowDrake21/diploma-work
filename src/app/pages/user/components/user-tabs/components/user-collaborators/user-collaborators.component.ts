import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { UserService } from '@core/services/user.service';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { IUser } from '@shared/models/user.model';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'user-collaborators',
  imports: [CommonModule, UserCardComponent, MatListModule, AsyncPipe],
  templateUrl: './user-collaborators.component.html',
  styleUrl: './user-collaborators.component.scss',
})
export class UserCollaboratorsComponent implements OnInit {
  private userService = inject(UserService);
  userIdSig = input.required<number>({
    alias: 'userId',
  });
  collaborators$!: Observable<IUser[]>;

  ngOnInit(): void {
    if (!this.userIdSig()) {
      throw new Error('User ID is required');
    }
    this.collaborators$ = this.userService
      .getUserCollaborators(this.userIdSig())
      .pipe(map((response) => response.data));
  }
}
