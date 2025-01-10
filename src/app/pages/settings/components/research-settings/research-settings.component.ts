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
  selector: 'app-research-settings',
  imports: [
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './research-settings.component.html',
  styleUrl: './research-settings.component.scss',
})
export class ResearchSettingsComponent {
  researchSettings = {
    defaultType: 'publications',
    yearRange: {
      start: 2000,
      end: 2024,
    },
    enableSharing: false,
    searchSensitivity: 'medium',
  };

  settingsForm = new FormGroup({
    defaultType: new FormControl(this.researchSettings.defaultType, [
      Validators.required,
    ]),
    yearRange: new FormGroup({
      start: new FormControl(this.researchSettings.yearRange.start, [
        Validators.required,
      ]),
      end: new FormControl(this.researchSettings.yearRange.end, [
        Validators.required,
      ]),
    }),
    enableSharing: new FormControl(this.researchSettings.enableSharing, [
      Validators.required,
    ]),
  });

  saveResearchSettings() {
    console.log('Research settings saved', this.researchSettings);
  }
}
