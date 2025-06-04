import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { catchError, map, Observable, of } from 'rxjs';
import { Filter } from '@shared/types/filters.types';
import { BaseFormComponent } from '@shared/abstract/base-form/base-form.component';
import {
  BaseFormInputs,
  ResearchFormGroup,
} from '@shared/types/forms/project-form.types';
import { UserService } from '@core/services/users/user.service';
import { NotificationService } from '@core/services/notification.service';
import { statuses } from '@shared/content/project.content';

@Component({
  selector: 'create-project-research-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
  ],
  templateUrl: './project-research-form.component.html',
  styleUrl: './project-research-form.component.scss',
})
export class ProjectResearchFormComponent
  extends BaseFormComponent
  implements OnInit
{
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  researchProjectsForm = input.required<ResearchFormGroup>();

  statuses = statuses;

  compareParticipants = (id1: string, id2: string) => this.compareIds(id1, id2);

  allUsers$!: Observable<BaseFormInputs['allUsers']>;

  ngOnInit(): void {
    this.allUsers$ = this.userService.getAllUsers().pipe(
      catchError((error) => {
        console.error('Error loading users:', error);
        this.notificationService.showError('Failed to load users');
        return of([]);
      })
    );
  }

  compareStatuses = (status1: string, status2: Filter | string) => {
    if (typeof status2 === 'string') {
      return status1 === status2;
    }
    return status1 === status2.value;
  };

  onSelectionChange(event: any) {
    console.log('event', event);
  }
}
