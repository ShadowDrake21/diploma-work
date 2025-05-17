import {
  Component,
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

@Component({
  selector: 'profile-avatar',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile-avatar.component.html',
  styleUrl: './profile-avatar.component.scss',
})
export class ProfileAvatarComponent implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  avatarUrl = input<string | null>(null);
  isLoading = input<boolean>(false);
  avatarUpload = output<File>();

  readonly selectedImagePreview = signal<SafeUrl | null>(null);
  readonly errorMessage = signal('');
  readonly temporaryAvatarUrl = signal<SafeUrl | null>(null);

  readonly displayAvatarUrl = () => {
    return this.temporaryAvatarUrl() || this.avatarUrl();
  };

  onUploadClick(): void {
    this.fileInput()?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const file = input.files[0];
    this.validateAndPreviewFile(file);
  }

  private validateAndPreviewFile(file: File): void {
    this.errorMessage.set('');
    this.errorMessage.set('');

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

  confirmUpload(): void {
    if (!this.selectedImagePreview() || !this.fileInput()) return;

    // Get the file from the input again
    const file = this.fileInput()?.nativeElement.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      this.temporaryAvatarUrl.set(
        this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      );

      this.avatarUpload.emit(file);
      this.selectedImagePreview.set(null);
      this.fileInput()!.nativeElement.value = '';
    }
  }

  ngOnDestroy(): void {
    if (this.temporaryAvatarUrl()) {
      URL.revokeObjectURL(this.temporaryAvatarUrl() as string);
    }
  }
}
