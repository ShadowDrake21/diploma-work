import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  output,
  Output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'profile-avatar',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss',
})
export class ProfileAvatarComponent {
  private readonly sanitizer = inject(DomSanitizer);

  avatarUrl = input<string | null>(null);
  isLoading = input<boolean>(false);
  avatarUpload = output<File>();

  readonly selectedImagePreview = signal<SafeUrl | null>(null);
  readonly errorMessage = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const file = input.files[0];
    this.errorMessage.set('');

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('File must be smaller than 5MB');
      return;
    }

    this.createImagePreview(file);
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.selectedImagePreview.set(
          this.sanitizer.bypassSecurityTrustUrl(e.target.result as string)
        );
      }
    };
    reader.readAsDataURL(file);
  }

  uploadAvatar(): void {
    if (!this.selectedImagePreview()) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => this.onFileSelected(event);
    input.click();
  }

  confirmUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files?.[0]) {
        this.avatarUpload.emit(fileInput.files[0]);
        this.selectedImagePreview.set(null);
      }
    };
    input.click();
  }
}
