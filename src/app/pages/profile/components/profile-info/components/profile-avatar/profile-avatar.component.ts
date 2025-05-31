import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Input,
  OnDestroy,
  output,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserService } from '@core/services/users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { IUser } from '@models/user.model';

@Component({
  selector: 'profile-avatar',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss',
})
export class ProfileAvatarComponent implements OnDestroy {
  private readonly userService = inject(UserService);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // Inputs
  user = input<IUser | null>(null);
  isLoading = signal<boolean>(false);

  // Outputs
  updateSuccess = output<IUser>();
  updateFailure = output<void>();

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
      return;
    }

    if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
      this.errorMessage.set(
        'Only image files are allowed (JPEG, PNG, GIF, WEBP)'
      );
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
    reader.readAsDataURL(file);
  }

  onAvatarChanged(): void {
    this.isLoading.set(true);

    if (!this.selectedFile()) {
      this.errorMessage.set('No file selected');
      this.isLoading.set(false);
      return;
    }

    this.userService.updateUserAvatar(this.selectedFile()!).subscribe({
      next: (response) => {
        if (response.data) {
          const newAvatarUrl = response.data.avatarUrl;
          const currentUser = this.user();
          if (currentUser) {
            this.updateSuccess.emit({
              ...currentUser,
              avatarUrl: newAvatarUrl,
            });
            this.resetUploadState();
          }
        }
      },
      error: (error) => {
        console.error('Avatar upload failed:', error);
        this.updateFailure.emit();
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
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
