import {
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { IUser } from '@models/user.model';

@Component({
  selector: 'profile-avatar',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss',
})
export class ProfileAvatarComponent implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  user = input<IUser | null>(null);
  isLoading = signal<boolean>(false);

  updateSuccess = output<IUser>();
  updateFailure = output<any>();

  // Internal signals
  readonly previewUrl = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly showPreview = signal(false);
  readonly selectedFile = signal<File | null>(null);

  onUploadClick(): void {
    this.fileInput()?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.validateFile(file);
  }

  private validateFile(file: File): void {
    this.errorMessage.set('');
    this.selectedFile.set(file);

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('File must be smaller than 5MB');
      this.notificationService.showError('File must be smaller than 5MB');

      return;
    }

    if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
      const errorMsg = 'Only image files are allowed (JPEG, PNG, GIF, WEBP)';
      this.errorMessage.set(errorMsg);
      this.notificationService.showError(errorMsg);
      return;
    }

    this.createPreview(file);
    this.showPreview.set(true);
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.onerror = () => {
      this.errorMessage.set('Failed to preview image');
      this.notificationService.showError('Failed to preview selected image');
    };
    reader.readAsDataURL(file);
  }

  onAvatarChanged(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('No file selected');
      return;
    }

    this.userService.updateUserAvatar(this.selectedFile()!).subscribe({
      next: (response) => {
        const newAvatarUrl = response.avatarUrl;
        const currentUser = this.user();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            avatarUrl: newAvatarUrl,
          };
          this.updateSuccess.emit(updatedUser);
          this.notificationService.showSuccess('Avatar updated successfully');
          this.resetUploadState();
        }
      },
      error: (error) => {
        console.error('Avatar upload failed:', error);
        this.updateFailure.emit(error);
        this.handleUploadError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  private handleUploadError(error: any): void {
    let errorMessage = 'Failed to upload avatar';

    if (error.status === 413) {
      errorMessage = 'Image size too large (max 5MB)';
    } else if (error.status === 415) {
      errorMessage = 'Unsupported image format';
    } else if (error.status === 0) {
      errorMessage = 'Network error - please check your connection';
    }

    this.errorMessage.set(errorMessage);
    this.notificationService.showError(errorMessage);
  }

  cancelUpload(): void {
    this.resetUploadState();
  }

  private resetUploadState(): void {
    this.showPreview.set(false);
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.resetFileInput();
  }

  private resetFileInput(): void {
    if (this.fileInput()?.nativeElement) {
      this.fileInput()!.nativeElement.value = '';
    }
  }

  ngOnDestroy(): void {
    this.resetUploadState();
  }
}
