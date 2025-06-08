import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'custom-loader',
  template: `<div class="loader" [style]="loaderStyles"></div> `,
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  diameter = input(75);

  get loaderStyles() {
    const borderWidth = Math.max(4, this.diameter() * 0.1);

    return {
      width: `${this.diameter()}px`,
      height: `${this.diameter()}px`,
      borderWidth: `${borderWidth}px`,
    };
  }
}
