import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { throwError } from 'rxjs';

@Component({
  selector: 'shared-multiple-file-upload',
  imports: [MatListModule, MatIconModule],
  templateUrl: './multiple-file-upload.component.html',
  styleUrl: './multiple-file-upload.component.scss',
})
export class MultipleFileUploadComponent {
  status: 'initial' | 'uploading' | 'success' | 'fail' = 'initial';
  files: File[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  onChange(event: any) {
    const files = event.target.files;

    if (files.length) {
      this.status = 'initial';
      this.files = files;
    }
  }

  onUpload() {
    // if (this.files.length) {
    //   const formData = new FormData();

    //   [...this.files].forEach((file) => {
    //     formData.append('file', file, file.name);
    //   });

    //   const upload$ = this.http.post('https://httpbin.com/post', formData);

    //   this.status = 'uploading';

    //   upload$.subscribe({
    //     next: () => {
    //       this.status = 'success';
    //     },
    //     error: (error: any) => {
    //       this.status = 'fail';
    //       return throwError(() => error);
    //     },
    //   });
    // }

    console.log('Uploading files...');
  }
}
