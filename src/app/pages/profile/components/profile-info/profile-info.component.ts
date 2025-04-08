import { Component, inject, input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { IProfileInfo } from '@shared/types/profile.types';
import { UserService } from '@core/services/user.service';
import { Observable, tap } from 'rxjs';
import { IAuthorizedUser, IUser } from '@shared/types/users.types';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AsyncPipe } from '@angular/common';

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
    MatProgressBarModule,
    AsyncPipe,
  ],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.scss',
})
export class ProfileInfoComponent implements OnInit {
  private userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);

  user$!: Observable<IUser>;
  editMode = false;
  isLoading = false;

  profileForm = new FormGroup({
    dateOfBirth: new FormControl<string | null>(null),
    userType: new FormControl<
      'student' | 'teacher' | 'researcher' | 'staff' | null
    >(null),
    universityGroup: new FormControl<string | null>(null),
    phoneNumber: new FormControl<string | null>(null, [
      Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/),
    ]),
  });

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser().pipe(
      tap((user) => {
        this.profileForm.patchValue({
          dateOfBirth: user.dateOfBirth || null,
          userType: user.userType || null,
          universityGroup: user.universityGroup || null,
          phoneNumber: user.phoneNumber || null,
        });
      })
    );
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this._snackBar.open(
        'Please fill in all required fields correctly.',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    this.isLoading = true;
    const formValue = this.profileForm.value;

    console.log('Form Value:', formValue);
    this.userService
      .updateUserProfile({
        phoneNumber: formValue.phoneNumber || undefined,
        dateOfBirth: formValue.dateOfBirth || undefined,
        userType: formValue.userType || undefined,
        universityGroup: formValue.universityGroup || undefined,
      })
      .subscribe({
        next: (user) => {
          this._snackBar.open('Profile updated successfully.', 'Close', {
            duration: 3000,
          });
          this.editMode = false;
          console.log('Updated User:', user);
          this.profileForm.patchValue({
            dateOfBirth: user.dateOfBirth || null,
            userType: user.userType || null,
            universityGroup: user.universityGroup || null,
            phoneNumber: user.phoneNumber || null,
          });
          this.user$ = this.userService.getCurrentUser();
        },
        error: (err) => {
          console.log('Failed to update profile', err);
          this._snackBar.open(
            'Failed to update profile. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
        },
        complete: () => (this.isLoading = false),
      });
  }
}
