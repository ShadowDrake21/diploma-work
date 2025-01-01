import { Component } from '@angular/core';
import { frequentLinksContent } from '../../../../../content/frequentLinks.content';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'shared-frequent-links',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './frequent-links.component.html',
  styleUrl: './frequent-links.component.scss',
})
export class FrequentLinksComponent {
  frequentLinks = frequentLinksContent;
}
