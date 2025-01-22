import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {
  NEW_PROJECTS_ACTIVITIES,
  USERS_ACTIVITIES,
} from '@content/recentActivities.content';

@Component({
  selector: 'admin-dashboard-recent-activities',
  imports: [MatTableModule, DatePipe],
  templateUrl: './recent-activities.component.html',
  styleUrl: './recent-activities.component.scss',
})
export class RecentActivitiesComponent {
  displayedUserActivitiesColumns: string[] = ['user', 'activity'];
  userActivitiesSource = USERS_ACTIVITIES;

  displayedNewProjectsColumns: string[] = ['user', 'project', 'date'];
  NewProjectsSource = NEW_PROJECTS_ACTIVITIES;
}
