import {
  Component,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { PHONE_NUMBER_PATTERN } from '@core/constants/paterns';
import { IUser } from '@models/user.model';
import { ProfileForm } from '@shared/types/forms/profile-form.types';

@Component({
  selector: 'profile-edit',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit, OnChanges {
  user = input.required<IUser>();
  isLoading = input<boolean>(false);
  save = output<any>();
  cancel = output<void>();

  profileForm = this.initializeForm();

  ngOnInit(): void {
    this.patchProfileForm(this.user());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.patchProfileForm(this.user());
    }
  }

  private patchProfileForm(user: IUser): void {
    this.profileForm.patchValue({
      dateOfBirth: user.dateOfBirth || null,
      userType: user.userType || null,
      universityGroup: user.universityGroup || null,
      phoneNumber: user.phoneNumber || null,
    });
  }

  private initializeForm(): FormGroup<ProfileForm> {
    return new FormGroup<ProfileForm>({
      dateOfBirth: new FormControl(null),
      userType: new FormControl(null),
      universityGroup: new FormControl(null),
      phoneNumber: new FormControl(null, [
        Validators.pattern(PHONE_NUMBER_PATTERN),
      ]),
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.save.emit(this.profileForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
