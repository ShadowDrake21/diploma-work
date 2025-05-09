import {
  Component,
  EventEmitter,
  forwardRef,
  inject,
  input,
  Output,
  output,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AttachmentsService } from '@core/services/attachments.service';
import { Observable } from 'rxjs';
import { ProjectSharedService } from '@core/services/project-shared.service';
import { MatButtonModule } from '@angular/material/button';
import { FileMetadataDTO } from '@models/file.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'shared-multiple-file-upload',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    FileSizePipe,
    DatePipe,
    JsonPipe,
  ],
  templateUrl: './multiple-file-upload.component.html',
  styleUrl: './multiple-file-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleFileUploadComponent),
      multi: true,
    },
  ],
})
export class MultipleFileUploadComponent implements ControlValueAccessor {
  formControl =
    input.required<FormControl<(File | FileMetadataDTO)[] | null>>();
  accept = input<string>('*');
  maxSizeMB = input<number | null>(null); // Optional max file size in MB

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileRemoved = new EventEmitter<number>();
  @Output() invalidFiles = new EventEmitter<{ file: File; reason: string }[]>();

  files: (File | FileMetadataDTO)[] = [];

  // ControlValueAccessor methods
  private onChange: (value: (File | FileMetadataDTO)[] | null) => void =
    () => {};
  private onTouched: () => void = () => {};

  writeValue(obj: (File | FileMetadataDTO)[] | null): void {
    this.files = obj || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  isFile(file: any): file is File {
    return file instanceof File;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);

    this.files = [...this.files, ...newFiles];

    this.updateControl();
    input.value = '';
  }

  private updateControl(): void {
    const newValue = [...this.files];
    this.onChange(newValue);
    this.onTouched();
    this.formControl().setValue(newValue, {
      emitEvent: false,
      emitModelToViewChange: false,
    });
  }
}
