import { Component, inject, input, OnInit } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { recentProjectContent } from '../../../../../../content/recentProjects.content';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationService } from '../../../../core/services/pagination.service';
import { AsyncPipe } from '@angular/common';
import { of } from 'rxjs';
import { IProfileInfo } from '../../../../shared/types/profile.types';

@Component({
  selector: 'profile-info',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatPaginatorModule,
  ],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss',
})
export class ProfileInfoComponent {
  profileSig = input.required<IProfileInfo>({ alias: 'profile' });

  phoneEdit = false;
}
