import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'shared-custom-button',
  imports: [MatButtonModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss',
})
export class CustomButtonComponent {
  disabled = input<boolean>(false);
  type = input<'submit' | 'button'>('submit');

  onPress = output<void>();
}
