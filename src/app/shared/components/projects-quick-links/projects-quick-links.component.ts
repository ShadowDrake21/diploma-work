import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shared-projects-quick-links',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './projects-quick-links.component.html',
  styleUrl: './projects-quick-links.component.scss',
})
export class ProjectsQuickLinksComponent {}
