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
import { map, Observable, tap } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AsyncPipe } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IUser, UserType } from '@models/user.model';

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
  private sanitizer = inject(DomSanitizer);

  user$!: Observable<IUser>;
  editMode = false;
  isLoading = false;

  selectedFile: File | null = null;
  errorMessage = '';

  profileForm = new FormGroup({
    dateOfBirth: new FormControl<string | null>(null),
    userType: new FormControl<UserType | null>(null),
    universityGroup: new FormControl<string | null>(null),
    phoneNumber: new FormControl<string | null>(null, [
      Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/),
    ]),
  });

  selectedImagePreview: SafeUrl | null = null;

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser().pipe(
      map((user) => user.data),
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
    const formattedDate = new Date(formValue.dateOfBirth ?? '')
      .toISOString()
      .split('T')[0];
    console.log('Form Value:', formValue);
    this.userService
      .updateUserProfile({
        phoneNumber: formValue.phoneNumber || undefined,
        dateOfBirth: formattedDate,
        userType: formValue.userType || undefined,
        universityGroup: formValue.universityGroup || undefined,
      })
      .pipe(map((response) => response.data))
      .subscribe({
        next: (user) => {
          this._snackBar.open('Profile updated successfully.', 'Close', {
            duration: 3000,
          });
          this.editMode = false;
          console.log('Updated User:', user);
          // TODO: does not work
          this.profileForm.patchValue({
            dateOfBirth: user.dateOfBirth || null,
            userType: user.userType || null,
            universityGroup: user.universityGroup || null,
            phoneNumber: user.phoneNumber || null,
          });
          this.user$ = this.userService
            .getCurrentUser()
            .pipe(map((user) => user.data));
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = '';

      // Basic validation
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File must be smaller than 5MB';
        this.selectedFile = null;
        this.selectedImagePreview = null;
        return;
      }

      this.createImagePreview(this.selectedFile);
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Sanitize the URL for security
      this.selectedImagePreview = this.sanitizer.bypassSecurityTrustUrl(
        e.target.result
      );
    };
    reader.readAsDataURL(file);
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.userService.updateUserAvatar(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Avatar updated successfully', response);
        this.selectedImagePreview = null;
        this.user$ = this.userService
          .getCurrentUser()
          .pipe(map((user) => user.data));
      },
      error: (error) => {
        console.error('Avatar upload failed', error);
        this.errorMessage = 'Failed to upload avatar. Please try again.';
      },
    });
  }
}
