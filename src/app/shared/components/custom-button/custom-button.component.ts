import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'shared-custom-button',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss',
})
export class CustomButtonComponent {
  disabled = input<boolean>(false);
  type = input<'submit' | 'button'>('submit');
  isLoading = input<boolean>(false);

  onPress = output<void>();
}
