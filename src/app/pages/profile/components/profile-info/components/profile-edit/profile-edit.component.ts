import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
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
import { NotificationService } from '@core/services/notification.service';
import { IUser, SocialLink } from '@models/user.model';
import { ProfileForm } from '@shared/types/forms/profile-form.types';
import { LoaderComponent } from '../../../../../../shared/components/loader/loader.component';

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
    LoaderComponent,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit, OnChanges {
  private readonly notificationService = inject(NotificationService);

  user = input.required<IUser>();
  isLoading = input<boolean>(false);
  save = output<any>();
  cancel = output<void>();
  socialLinks = signal<{ url: string; name: string }[]>([]);
  newLink = '';

  readonly formError = signal<string | null>(null);

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
    try {
      this.profileForm.patchValue({
        dateOfBirth: user.dateOfBirth || null,
        userType: user.userType || null,
        universityGroup: user.universityGroup || null,
        phoneNumber: user.phoneNumber || null,
      });
      this.setSocialLinks(user.socialLinks || []);
    } catch (error) {
      this.formError.set('Failed to initialize form data');
      console.error('Error patching profile form:', error);
    }
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
    try {
      while (this.socialLinksArray.length) {
        this.socialLinksArray.removeAt(0);
      }
      links.forEach((link) => this.addSocialLinkControl(link));
    } catch (error) {
      this.formError.set('Failed to set social links');
      console.error('Error setting social links:', error);
    }
  }

  addSocialLink(): void {
    const newLink = this.newLink.trim();
    if (!newLink) return;
    try {
      if (!this.isValidUrl(newLink)) {
        this.notificationService.showError('Please enter a valid URL');
        return;
      }
      this.socialLinksArray.push(
        new FormGroup({
          url: new FormControl(newLink, Validators.required),
          name: new FormControl(''),
        })
      );
      this.newLink = '';
    } catch (error) {
      this.notificationService.showError('Failed to add social link');
      console.error('Error adding social link:', error);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  removeSocialLink(index: number): void {
    try {
      this.socialLinksArray.removeAt(index);
    } catch (error) {
      this.notificationService.showError('Failed to remove social link');
      console.error('Error removing social link:', error);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.formError.set('Please correct the errors in the form');
      this.notificationService.showError('Please correct the form errors');
      return;
    }

    this.formError.set(null);
    this.save.emit(this.profileForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
