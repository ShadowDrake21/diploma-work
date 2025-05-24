import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { FrequentLinksComponent } from '@shared/components/frequent-links/frequent-links.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { UserService } from '@core/services/user.service';
import { map, Subscription } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ProfileComponent {
  private readonly headerService = inject(HeaderService);
  private readonly userService = inject(UserService);

  myProjects = toSignal(
    this.userService
      .getCurrentUserProjects()
      .pipe(map((response) => response.data))
  );

  private subscription!: Subscription;
}
