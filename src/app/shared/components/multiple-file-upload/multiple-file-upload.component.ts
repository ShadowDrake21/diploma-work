import { HttpClient } from '@angular/common/http';
import { Component, inject, input, output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FormControl } from '@angular/forms';
import { AttachmentsService } from '@core/services/attachments.service';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { stringToProjectType } from '@shared/utils/convert.utils';

@Component({
  selector: 'shared-multiple-file-upload',
  imports: [MatListModule, MatIconModule],
  templateUrl: './multiple-file-upload.component.html',
  styleUrl: './multiple-file-upload.component.scss',
})
export class MultipleFileUploadComponent {
  private http = inject(HttpClient);
  private attachmentsService = inject(AttachmentsService);

  formControlSig = input.required<FormControl<string[] | null>>({
    alias: 'formControl',
  });
  entityTypeSig = input.required<string | null | undefined>({
    alias: 'entityType',
  });
  uploadCompleteSig = output<string[]>({ alias: 'uploadComplete' });

  status: 'initial' | 'uploading' | 'success' | 'fail' = 'initial';
  files: File[] = [];

  onChange(event: any) {
    const files = event.target.files;

    if (files.length) {
      this.status = 'initial';
      this.files = Array.from(files);
    }
  }

  onUpload() {
    if (this.files.length && this.entityTypeSig()) {
      this.status = 'uploading';

      const entityType = stringToProjectType(this.entityTypeSig() as string);

      if (!entityType) {
        console.error('Invalid entity type: ', this.entityTypeSig());
        return;
      }

      const uploadObservables = this.files.map((file) =>
        this.attachmentsService.uploadFile(file, entityType).pipe(
          catchError((error) => {
            console.log('Error uploading file', error);
            return of(null);
          })
        )
      );

      forkJoin(uploadObservables)
        .pipe(
          finalize(() => {
            this.status = 'success';
          })
        )
        .subscribe((responses) => {
          const fileUrls = responses.filter((url) => url !== null) as string[];
          this.uploadCompleteSig.emit(fileUrls);
          this.formControlSig().setValue(fileUrls);
        });
    }
  }
}
