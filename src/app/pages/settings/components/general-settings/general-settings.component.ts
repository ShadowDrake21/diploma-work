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
  selector: 'app-general-settings',
  imports: [
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.scss',
})
export class GeneralSettingsComponent {
  settings = {
    language: 'ua',
    display: {
      sortBy: 'Year',
      itemsPerPage: 10,
    },
    notifications: true,
    sessionTimeout: 45,
  };

  settingsForm = new FormGroup({
    language: new FormControl(this.settings.language, [Validators.required]),
    display: new FormGroup({
      sortBy: new FormControl(this.settings.display.sortBy, [
        Validators.required,
      ]),
      itemsPerPage: new FormControl(this.settings.display.itemsPerPage, [
        Validators.required,
      ]),
    }),
    notifications: new FormControl(this.settings.notifications, [
      Validators.required,
    ]),
    sessionTimeout: new FormControl(this.settings.sessionTimeout, [
      Validators.required,
    ]),
  });

  resetToDefaults() {
    console.log('Settings reset to defaults');
  }

  saveSettings() {
    console.log('Settings saved', this.settings);
  }
}
