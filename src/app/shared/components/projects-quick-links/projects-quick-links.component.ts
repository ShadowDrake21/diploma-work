import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shared-projects-quick-links',
  imports: [RouterLink],
  templateUrl: './projects-quick-links.component.html',
})
export class ProjectsQuickLinksComponent {
  showMine = true;

  get toggleLinkParams() {
    return this.showMine ? { mode: 'mine' } : { mode: 'all' };
  }

  get buttonText() {
    return this.showMine
      ? 'Переглянути мої проекти'
      : 'Переглянути всі проекти';
  }

  toggleMode() {
    this.showMine = !this.showMine;
  }
}
