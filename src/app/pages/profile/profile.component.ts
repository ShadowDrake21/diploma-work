import { Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { projectTags } from '../../../../content/filterProjectTags.content';
import { Filter } from '../../shared/types/filters.types';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';

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
    FilterPanelComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ProfileComponent implements OnInit {
  private headerService = inject(HeaderService);
  phoneEdit = false;

  profile = {
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

  ngOnInit(): void {
    this.headerService.setTitle(`User ${this.profile.username}`);
  }
}
