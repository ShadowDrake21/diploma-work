import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/utils/navigation/navigation.component';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {}
