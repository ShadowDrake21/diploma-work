import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'shared-projects-quick-links',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './projects-quick-links.component.html',
})
export class ProjectsQuickLinksComponent {}
