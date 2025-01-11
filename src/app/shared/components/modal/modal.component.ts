import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NotificationItemComponent } from '../../../pages/modals/notification-item/notification-item.component';

@Component({
  selector: 'app-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    NotificationItemComponent,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  data = inject(MAT_DIALOG_DATA);
}
