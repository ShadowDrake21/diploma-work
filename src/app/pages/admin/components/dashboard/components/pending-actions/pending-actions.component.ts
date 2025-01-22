import { Component } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { CommentComponent } from '../../../../../../shared/components/comment/comment.component';

@Component({
  selector: 'admin-dashboard-pending-actions',
  imports: [MatList, MatListItem, CommentComponent],
  templateUrl: './pending-actions.component.html',
  styleUrl: './pending-actions.component.scss',
})
export class PendingActionsComponent {
  comment = {
    id: 'c1',
    userId: 'u1',
    userName: 'Remigiusz Mróz',
    avatarUrl:
      'https://ocdn.eu/pulscms-transforms/1/CUYk9kuTURBXy9mMDFlODIxMi04NmE2LTRjMWEtYTgzMC01OGQxN2MxYzU5YzYuanBlZ5KaCs0B4M0BDigAAABLFBSTBc0B4M0BDt4AA6EwAaExAaEzww',
    timestamp: '2024-04-25T10:30:00Z',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit omnis animi et iure laudantium vitae, praesentium optio, sapiente distinctio illo?',
    likes: 12,
    replies: 3,
  };
}
