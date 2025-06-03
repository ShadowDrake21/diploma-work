import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authentication',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './authentication.component.html',
})
export class AuthenticationComponent {}
