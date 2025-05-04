import { Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '@core/services/header.service';
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
import { recentProjectContent } from '@content/recentProjects.content';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationService } from '@core/services/pagination.service';
import { FrequentLinksComponent } from '@shared/components/frequent-links/frequent-links.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { IProfileInfo } from '@shared/types/profile.types';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { UserService } from '@core/services/user.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProjectDTO } from '@models/project.model';

@Component({
  selector: 'app-profile',
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
    FrequentLinksComponent,
    ProfileInfoComponent,
    ProfileProjectsComponent,
    AsyncPipe,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [provideNativeDateAdapter(), PaginationService],
})
export class ProfileComponent implements OnInit {
  private headerService = inject(HeaderService);
  private userService = inject(UserService);
  paginationService = inject(PaginationService);

  profile: IProfileInfo = {
    username: '@edwardddrake',
    name: 'Edward D. Drake',
    email: 'edwardddrake@stu.cn.ua',
    role: 'user',
    userType: 'student',
    universityGroup: 'PI-211',
    phone: '+1 202-555-0136',
    birthday: '25.01.2006',
    imageUrl: '/recent-users/user-1.jpg',
  };

  myProjects$!: Observable<ProjectDTO[] | null>;

  ngOnInit(): void {
    this.headerService.setTitle(`User ${this.profile.username}`);
    this.myProjects$ = this.userService.getCurrentUserProjects();
  }
}
