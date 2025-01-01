import { Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profile',
  imports: [MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
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
