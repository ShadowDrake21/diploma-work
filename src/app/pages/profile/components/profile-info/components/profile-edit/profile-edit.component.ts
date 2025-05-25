import {
  Component,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { PHONE_NUMBER_PATTERN } from '@core/constants/paterns';
import { IUser, SocialLink } from '@models/user.model';
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
    FormsModule,
    MatIcon,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit, OnChanges {
  user = input.required<IUser>();
  isLoading = input<boolean>(false);
  save = output<any>();
  cancel = output<void>();
  socialLinks = signal<{ url: string; name: string }[]>([]);
  newLink = '';

  profileForm!: FormGroup<ProfileForm>;

  ngOnInit(): void {
    this.profileForm = this.initializeForm();
    this.patchProfileForm(this.user());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.patchProfileForm(this.user());
    }
  }

  private initializeForm(): FormGroup<ProfileForm> {
    return new FormGroup<ProfileForm>({
      dateOfBirth: new FormControl(null),
      userType: new FormControl(null),
      universityGroup: new FormControl(null),
      phoneNumber: new FormControl(null, [
        Validators.pattern(PHONE_NUMBER_PATTERN),
      ]),
      socialLinks: new FormArray<
        FormGroup<{ url: FormControl<string>; name: FormControl<string> }>
      >([]),
    });
  }

  private patchProfileForm(user: IUser): void {
    this.profileForm.patchValue({
      dateOfBirth: user.dateOfBirth || null,
      userType: user.userType || null,
      universityGroup: user.universityGroup || null,
      phoneNumber: user.phoneNumber || null,
    });
    this.setSocialLinks(user.socialLinks || []);
  }

  get socialLinksArray(): FormArray {
    return this.profileForm.get('socialLinks') as FormArray;
  }

  private addSocialLinkControl(link: SocialLink): void {
    this.socialLinksArray.push(
      new FormGroup({
        url: new FormControl(link.url, Validators.required),
        name: new FormControl(link.name || ''),
      })
    );
  }

  private setSocialLinks(links: SocialLink[]): void {
    while (this.socialLinksArray.length) {
      this.socialLinksArray.removeAt(0);
    }
    links.forEach((link) => this.addSocialLinkControl(link));
  }

  addSocialLink(): void {
    if (this.newLink.trim()) {
      this.socialLinksArray.push(
        new FormGroup({
          url: new FormControl(this.newLink.trim(), Validators.required),
          name: new FormControl(''),
        })
      );
      this.newLink = '';
    }
  }

  removeSocialLink(index: number): void {
    this.socialLinksArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.save.emit(this.profileForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
