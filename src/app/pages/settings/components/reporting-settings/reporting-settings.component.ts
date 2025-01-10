import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reporting-settings',
  imports: [
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reporting-settings.component.html',
  styleUrl: './reporting-settings.component.scss',
})
export class ReportingSettingsComponent {
  reportingSettings = {
    format: 'pdf',

    deliveryMethod: 'download',
    scheduleReports: false,
    includeVisualizations: true,
  };

  settingsForm = new FormGroup({
    format: new FormControl(this.reportingSettings.format, [
      Validators.required,
    ]),
    deliveryMethod: new FormControl(this.reportingSettings.deliveryMethod, [
      Validators.required,
    ]),
    scheduleReports: new FormControl(this.reportingSettings.scheduleReports, [
      Validators.required,
    ]),
    includeVisualizations: new FormControl(
      this.reportingSettings.includeVisualizations,
      [Validators.required]
    ),
  });
  saveReportingSettings() {}
}
