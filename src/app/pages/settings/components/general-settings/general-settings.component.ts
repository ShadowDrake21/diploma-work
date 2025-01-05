import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
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
    notifications: {
      enableEmail: true,
    },
    security: {
      sessionTimeout: 45,
    },
  };

  saveSettings() {
    console.log('Settings saved', this.settings);
  }
}
