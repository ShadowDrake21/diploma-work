import { HttpClient } from '@angular/common/http';
import {
  Component,
  forwardRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AttachmentsService } from '@core/services/attachments.service';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';
import { stringToProjectType } from '@shared/utils/convert.utils';
import { ProjectSharedService } from '@core/services/project-shared.service';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'shared-multiple-file-upload',
  imports: [MatListModule, MatIconModule, MatButtonModule, AsyncPipe, DatePipe],
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
  private attachmentsService = inject(AttachmentsService);
  private projectSharedService = inject(ProjectSharedService);

  formControlSig = input.required<FormControl<File[] | null>>({
    alias: 'formControl',
  });
  entityTypeSig = input.required<string | null | undefined>({
    alias: 'entityType',
  });

  status: 'initial' | 'uploading' | 'success' | 'fail' = 'initial';
  files: File[] = [];
  existingFiles$!: Observable<any[]>;

  isProjectCreation: boolean = this.projectSharedService.isProjectCreation;

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(obj: File[] | null): void {
    if (obj) {
      this.files = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  // Handle file input changes
  onFileChange(event: any) {
    const files = event.target.files;

    if (files.length) {
      this.status = 'initial';
      this.files = Array.from(files);
      this.formControlSig().setValue(this.files);
      this.onChange(this.files); // Notify Angular of the change
      this.onTouched(); // Notify Angular that the component was touched
    }
  }

  // Reset files
  onResetFiles() {
    this.files = [];
    this.formControlSig().setValue(null);
    this.isProjectCreation = true;
    this.onChange(this.files); // Notify Angular of the change
    this.onTouched(); // Notify Angular that the component was touched
  }

  // onUpload() {
  //   if (this.files.length && this.entityTypeSig()) {
  //     this.status = 'uploading';

  //     const entityType = stringToProjectType(this.entityTypeSig() as string);

  //     if (!entityType) {
  //       console.error('Invalid entity type: ', this.entityTypeSig());
  //       return;
  //     }

  //     if (!this.projectIdSig()) {
  //       console.error('Invalid project id: ', this.projectIdSig());
  //       return;
  //     }

  //     const uploadObservables = this.files.map((file) =>
  //       this.attachmentsService
  //         .uploadFile(file, entityType, this.projectIdSig()!)
  //         .pipe(
  //           catchError((error) => {
  //             console.log('Error uploading file', error);
  //             return of(null);
  //           })
  //         )
  //     );

  //     forkJoin(uploadObservables)
  //       .pipe(
  //         finalize(() => {
  //           this.status = 'success';
  //         })
  //       )
  //       .subscribe((responses) => {
  //         this.uploadCompleteSig.emit(this.files);
  //         this.formControlSig().setValue(this.files);
  //       });
  //   }
  // }
}
