import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'shared-custom-button',
  imports: [MatButtonModule, MatProgressSpinnerModule, LoaderComponent],
  template: `
    <button
      mat-flat-button
      class=" w-full relative"
      [type]="type()"
      [disabled]="disabled() || isLoading()"
      (click)="onPress.emit()"
    >
      <div class="flex items-center justify-center gap-2 uppercase">
        @if (isLoading()) {
        <custom-loader [diameter]="20" />
        } @else {
        <ng-content></ng-content>
        }
      </div>
    </button>
  `,
  styleUrl: './custom-button.component.scss',
})
export class CustomButtonComponent {
  disabled = input<boolean>(false);
  type = input<'submit' | 'button'>('submit');
  isLoading = input<boolean>(false);

  onPress = output<void>();
}
